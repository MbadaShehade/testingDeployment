import subprocess
import os
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv(dotenv_path='../.env.local')  
mongo_uri = os.getenv('MONGODB_URI') 

client = MongoClient(mongo_uri)
db = client['MoldInBeehives']
users = db['users'].find({})

for user in users:
    username = user['username']
    chat_id = user['telegramChatId']
    for beehive in user.get('beehives', []):
        for hive in beehive.get('hives', []):
            hive_id = hive['id']
            cmd = [
                "nohup", "python", "telegram_scheduler_mqtt.py",
                "--hive_id", str(hive_id),
                "--chat_id", str(chat_id),
                "--username", username 
            ]
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)