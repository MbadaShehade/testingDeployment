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
import base64
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("telegram_scheduler_mqtt.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("telegram_scheduler_mqtt")

# Global variables
should_stop = False
latest_temperature = None
latest_humidity = None
data_received = False

# MQTT settings
BROKER = "test.mosquitto.org"
PORT = 1883
KEEPALIVE = 300  # 5 minutes

class MQTTDataCollector:
    def __init__(self, password, hive_id):
        self.password = password
        self.hive_id = hive_id
        self.client = None
        self.temp_topic = f"{self.password}/moldPrevention/hive{self.hive_id}/temp"
        self.humidity_topic = f"{self.password}/moldPrevention/hive{self.hive_id}/humidity"

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to MQTT broker")
            client.subscribe([(self.temp_topic, 0), (self.humidity_topic, 0)])
        else:
            logger.error(f"Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        global latest_temperature, latest_humidity, data_received
        topic = msg.topic
        try:
            value = float(msg.payload.decode())
            if topic == self.temp_topic:
                latest_temperature = value
                logger.info(f"Received temperature: {value}°C")
            elif topic == self.humidity_topic:
                latest_humidity = value
                logger.info(f"Received humidity: {value}%")
            data_received = True
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def connect(self):
        try:
            self.client = mqtt.Client()
            self.client.on_connect = self.on_connect
            self.client.on_message = self.on_message
            logger.info(f"Connecting to {BROKER}...")
            self.client.connect(BROKER, PORT, KEEPALIVE)
            return True
        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}")
            return False

    def start(self):
        if self.connect():
            self.client.loop_start()
            return True
        return False

    def stop(self):
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()

def signal_handler(sig, frame):
    global should_stop
    logger.info("Received termination signal. Gracefully shutting down...")
    should_stop = True

def send_report(hive_id, chat_id, username=None):
    global latest_temperature, latest_humidity, data_received
    
    if not data_received:
        logger.error("No sensor data received yet")
        return False
        
    logger.info(f"Sending scheduled report for hive {hive_id} to chat {chat_id}")
    
    # Prepare data for the report
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
    
    # Convert to JSON and escape single quotes for command line
    json_data = json.dumps(data).replace("'", "\\'")
    
    try:
        # Call the telegram_bot.py script to generate and send the PDF
        cmd = f"python telegram_bot.py '{json_data}'"
        logger.debug(f"Running command: {cmd}")
        
        process = subprocess.Popen(
            cmd, 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        )
        
        # Wait for the process to complete
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            logger.info("Report sent successfully")
            logger.debug(f"Output: {stdout.decode()}")
            return True
        else:
            logger.error(f"Failed to send report: {stderr.decode()}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending report: {e}")
        return False

def run_scheduler(hive_id, chat_id, password, username=None, interval='24h'):
    global should_stop, data_received
    
    # Parse interval
    if interval == '15s':
        sleep_seconds = 15
        interval_text = "15 seconds"
    elif interval == '1h':
        sleep_seconds = 3600  # 1 hour in seconds
        interval_text = "1 hour"
    elif interval == '24h':
        sleep_seconds = 86400  # 24 hours in seconds
        interval_text = "24 hours"
    else:
        # Default to 24 hours if interval not recognized
        sleep_seconds = 86400
        interval_text = "24 hours (default)"
    
    logger.info(f"Starting scheduler for hive {hive_id}")
    logger.info(f"Settings: Sending reports every {interval_text}")
    
    # Initialize MQTT data collector
    mqtt_collector = MQTTDataCollector(password, hive_id)
    if not mqtt_collector.start():
        logger.error("Failed to start MQTT data collector")
        return
    
    try:
        # Main loop
        while not should_stop:
            logger.info(f"Waiting {interval_text} until next report...")
            
            # Sleep in small increments to check for stop signal
            remaining = sleep_seconds
            while remaining > 0 and not should_stop:
                time.sleep(min(10, remaining))  # Sleep in 10-second chunks for better responsiveness
                remaining -= 10
                
            if should_stop:
                break
                
            # Send the report
            success = send_report(hive_id, chat_id, username)
            if success:
                logger.info("Report sent successfully")
            else:
                logger.error("Failed to send report")
                
    finally:
        mqtt_collector.stop()
        logger.info("Scheduler stopped.")

def main():
    parser = argparse.ArgumentParser(description='Schedule beehive reports to be sent via Telegram')
    parser.add_argument('--hive_id', required=True, help='Hive ID for the report')
    parser.add_argument('--chat_id', required=True, help='Telegram chat ID to send reports to')
    parser.add_argument('--password', required=True, help='Password for MQTT topics')
    parser.add_argument('--username', help='Username to include in the report')
    parser.add_argument('--interval', default='24h', choices=['15s', '1h', '24h'], 
                        help='Interval between reports: 15s (15 seconds), 1h (1 hour), or 24h (24 hours, default)')
    
    args = parser.parse_args()
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Log startup
        logger.info(f"Starting scheduler process with PID {os.getpid()}")
        logger.info(f"Arguments: {args}")
        
        # Run the scheduler with the specified parameters
        run_scheduler(
            args.hive_id, 
            args.chat_id,
            args.password,
            username=args.username,
            interval=args.interval
        )
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main() 