#!/usr/bin/env python3
import os
import argparse
import time
import json
import sys
import subprocess
import signal
import logging
from datetime import datetime
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Simple logging setup
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger("telegram_scheduler")

# Global variables
should_stop = False
latest_temperature = None
latest_humidity = None
data_received = False

class MQTTDataCollector:
    def __init__(self, username, hive_id):
        self.username = username
        self.hive_id = hive_id
        self.client = None
        self.temp_topic = f"{self.username}/moldPrevention/hive{self.hive_id}/temp"
        self.humidity_topic = f"{self.username}/moldPrevention/hive{self.hive_id}/humidity"

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to MQTT broker")
            client.subscribe([(self.temp_topic, 0), (self.humidity_topic, 0)])
        else:
            logger.error("Connection failed")

    def on_message(self, client, userdata, msg):
        global latest_temperature, latest_humidity, data_received
        topic = msg.topic
        try:
            value = float(msg.payload.decode())
            if topic == self.temp_topic:
                latest_temperature = value
            elif topic == self.humidity_topic:
                latest_humidity = value
            data_received = True
        except:
            pass

    def start(self):
        try:
            self.client = mqtt.Client()
            self.client.on_connect = self.on_connect
            self.client.on_message = self.on_message
            self.client.connect("test.mosquitto.org", 1883, 300)
            self.client.loop_start()
            return True
        except:
            return False

    def stop(self):
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()

def signal_handler(sig, frame):
    global should_stop
    should_stop = True

def send_report(hive_id, chat_id, username=None):
    global latest_temperature, latest_humidity, data_received
    
    if not data_received:
        return False
        
    data = {
        "hiveId": hive_id,
        "chatId": chat_id,
        "username": username,
        "temperature": latest_temperature,
        "humidity": latest_humidity,
        "sendNow": True,
        "forceWhiteBackground": True,
        "reportType": "Automatic Scheduled Report (Real-time Data)"
    }
    
    json_data = json.dumps(data).replace("'", "\\'")
    
    try:
        cmd = f"python python/telegram_bot.py '{json_data}'"
        process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        return process.returncode == 0
    except:
        return False

def run_scheduler(hive_id, chat_id, password, username=None):
    global should_stop, data_received
    if username is None:
        raise ValueError("Username must be provided for topic construction.")
    mqtt_collector = MQTTDataCollector(username, hive_id)
    if not mqtt_collector.start():
        return
    try:
        while not should_stop:
            time.sleep(86400)  # Sleep for 24 hours
            if not should_stop:
                send_report(hive_id, chat_id, username)
    finally:
        mqtt_collector.stop()

def main():
    parser = argparse.ArgumentParser(description='Schedule beehive reports to be sent via Telegram')
    parser.add_argument('--hive_id', required=True, help='Hive ID for the report')
    parser.add_argument('--chat_id', required=True, help='Telegram chat ID to send reports to')
    parser.add_argument('--username', required=True, help='Username to use as topic base')
    
    args = parser.parse_args()
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    run_scheduler(args.hive_id, args.chat_id, args.password, args.username)

if __name__ == "__main__":
    main() 