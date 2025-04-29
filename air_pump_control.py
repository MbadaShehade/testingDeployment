import paho.mqtt.client as mqtt
import time
import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# MongoDB settings
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = 'MoldInBeehives'

# MQTT broker settings
BROKER = "test.mosquitto.org"
PORT = 1883
KEEPALIVE = 300  # 5 minutes

class AirPumpController:
    def __init__(self, email, password, hive_id):
        self.email = email
        self.password = password
        self.hive_id = hive_id
        self.mongo_client = MongoClient(MONGODB_URI)
        self.db = self.mongo_client[DB_NAME]
        
        # Initialize MQTT topics
        self.TEMP_TOPIC = f"{self.password}/moldPrevention/hive{self.hive_id}/temp"
        self.HUMIDITY_TOPIC = f"{self.password}/moldPrevention/hive{self.hive_id}/humidity"
        self.AIR_PUMP_TOPIC = f"{self.password}/moldPrevention/hive{self.hive_id}/air_pump"
        
        # Initialize state
        self.current_temp = None
        self.current_humidity = None
        self.air_pump_state = "OFF"
        self.activation_start_time = None
        
        # Initialize MQTT client
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            client.subscribe([(self.TEMP_TOPIC, 0), (self.HUMIDITY_TOPIC, 0)])
        else:
            print(f"Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        value = float(msg.payload.decode())
        
        if topic == self.TEMP_TOPIC:
            self.current_temp = value
            print(f"Temperature for hive {self.hive_id}: {value}°C")
        elif topic == self.HUMIDITY_TOPIC:
            self.current_humidity = value
            print(f"Humidity for hive {self.hive_id}: {value}%")
        
        # Check conditions and control air pump
        self.control_air_pump()

    def control_air_pump(self):
        if self.current_temp is None or self.current_humidity is None:
            return

        # Check conditions for air pump activation
        should_activate = (
            self.current_temp < 26 or 
            self.current_temp > 38 or 
            self.current_humidity < 76.5 or 
            self.current_humidity > 85.6
        )

        new_state = "ON" if should_activate else "OFF"
        
        # If state changed
        if new_state != self.air_pump_state:
            self.air_pump_state = new_state
            
            # Publish new state to MQTT
            self.client.publish(self.AIR_PUMP_TOPIC, new_state)
            
            # Handle state change in database
            if new_state == "ON":
                self.activation_start_time = datetime.now()
                self.log_activation_start()
            else:
                self.log_activation_end()

    def log_activation_start(self):
        """Log when air pump is activated"""
        self.db.air_pump_activations.insert_one({
            "hive_id": self.hive_id,
            "start_time": self.activation_start_time,
            "temperature": self.current_temp,
            "humidity": self.current_humidity,
            "state": "ON"
        })

    def log_activation_end(self):
        """Log when air pump is deactivated and calculate duration"""
        if self.activation_start_time:
            end_time = datetime.now()
            duration = (end_time - self.activation_start_time).total_seconds()
            
            self.db.air_pump_activations.update_one(
                {
                    "hive_id": self.hive_id,
                    "state": "ON",
                    "end_time": {"$exists": False}
                },
                {
                    "$set": {
                        "end_time": end_time,
                        "duration_seconds": duration,
                        "state": "OFF"
                    }
                }
            )
            self.activation_start_time = None

    def connect(self):
        try:
            self.client.connect(BROKER, PORT, KEEPALIVE)
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"Error connecting to MQTT broker: {e}")
            return False

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()
        self.mongo_client.close()

if __name__ == "__main__":
    # Example usage
    controller = AirPumpController(
        email="user@example.com",
        password="user_password",
        hive_id="1"
    )
    
    if controller.connect():
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            controller.disconnect() 