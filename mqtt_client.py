import paho.mqtt.client as mqtt
import time
import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv


# MongoDB settings
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = 'MoldInBeehives'

# MQTT broker settings
BROKER = "test.mosquitto.org"
PORT = 1883
# Time in seconds to keep the connection alive before sending a ping
KEEPALIVE = 300  # 5 minutes

class MQTTClient:
    def __init__(self, email, password, hive_id):
        self.email = email
        self.password = password  # User's login password
        self.hive_id = hive_id
        self.client = None
        self.mongo_client = MongoClient(MONGODB_URI)
        self.db = self.mongo_client[DB_NAME]
        
        # Initialize topics with password prefix and hive ID
        self.TEMP_TOPIC = f"{self.password}/moldPrevention/hive{self.hive_id}/temp"
        self.HUMIDITY_TOPIC = f"{self.password}/moldPrevention/hive{self.hive_id}/humidity"

    def get_user_credentials(self):
        """Get user credentials from MongoDB"""
        try:
            user = self.db.users.find_one({"email": self.email})
            if user:
                return user.get("username"), self.password  
            return None, None
        except Exception as e:
            print(f"Error getting user credentials: {e}")
            return None, None

    def on_connect(self, client, userdata, flags, rc):
        """Callback when connecting to the MQTT broker"""
        if rc == 0:
            print("Connected to MQTT broker")
            # Subscribe to both topics
            client.subscribe([(self.TEMP_TOPIC, 0), (self.HUMIDITY_TOPIC, 0)])
        else:
            print(f"Connection failed with code {rc}")

    def on_message(self, client, userdata, msg):
        """Callback when receiving a message"""
        topic = msg.topic
        value = float(msg.payload.decode())
        
        if topic == self.TEMP_TOPIC:
            print(f"Temperature for hive {self.hive_id}: {value}°C")
        elif topic == self.HUMIDITY_TOPIC:
            print(f"Humidity for hive {self.hive_id}: {value}%")

    def connect(self):
        """Connect to the MQTT broker with user credentials"""
        try:
            # Get user credentials from MongoDB
            username, password = self.get_user_credentials()
            if not username or not password:
                raise ValueError("Could not retrieve user credentials")

            # Create MQTT client with user credentials
            self.client = mqtt.Client()
            self.client.username_pw_set(username, password)
            
            # Set callbacks
            self.client.on_connect = self.on_connect
            self.client.on_message = self.on_message
            
            # Connect to broker
            print(f"Connecting to {BROKER} as {username}...")
            self.client.connect(BROKER, PORT, KEEPALIVE)
            
            return True
            
        except Exception as e:
            print(f"Error connecting to MQTT broker: {e}")
            return False

    def start(self):
        """Start the MQTT client loop"""
        if self.connect():
            try:
                self.client.loop_forever()
            except KeyboardInterrupt:
                print("\nDisconnecting from broker")
                self.client.disconnect()
            except Exception as e:
                print(f"Error in MQTT loop: {e}")
            finally:
                self.mongo_client.close()
        else:
            print("Failed to connect to MQTT broker")

def main():
    email = "" 
    password = "" 
    hive_id = "" 
    
    mqtt_client = MQTTClient(email, password, hive_id)
    mqtt_client.start()

if __name__ == "__main__":
    main() 