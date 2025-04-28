import os
import requests
import sys
import json
from dotenv import load_dotenv
from hive_pdf import create_hive_report_pdf
import base64
import datetime

# Load environment variables
load_dotenv('.env.local')


def send_telegram_message(message, user_chat_id=None):
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    # Use provided chat_id or fall back to default from .env
    chat_id = user_chat_id or os.getenv('TELEGRAM_CHAT_ID')
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': message
    }
    
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            print("Message sent successfully!")
        else:
            print(f"Failed to send message. Status code: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {e}")


def send_telegram_pdf(hive_id=None, temperature=None, humidity=None, user_chat_id=None, temperature_image=None, humidity_image=None, username=None, send_now=False, force_white_background=False, report_type=None):
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    # Use provided chat_id or fall back to default from .env
    chat_id = user_chat_id or os.getenv('TELEGRAM_CHAT_ID')
    
    # If send_now is True, we need to fetch the latest data
    if send_now or temperature is None or humidity is None:
        print(f"Getting real-time data for hive {hive_id}...")
        # Try to read from a locally stored JSON file (if it exists)
        try:
            with open(f'hive_data_{hive_id}.json', 'r') as f:
                hive_data = json.load(f)
                # Only use file data if the direct parameters aren't set
                if temperature is None:
                    temperature = hive_data.get('temperature', 33.8)
                    print(f"Loaded temperature from file: {temperature}°C")
                if humidity is None:
                    humidity = hive_data.get('humidity', 58.2)
                    print(f"Loaded humidity from file: {humidity}%")
        except FileNotFoundError:
            # Fall back to default values only if parameters weren't passed in
            if temperature is None:
                temperature = 24.9  # Better default matching real data
                print(f"Using default temperature: {temperature}°C")
            if humidity is None:
                humidity = 77.6  # Better default matching real data
                print(f"Using default humidity: {humidity}%")
        except json.JSONDecodeError as e:
            print(f"Error parsing hive data file: {e}")
            if temperature is None:
                temperature = 24.9
            if humidity is None:
                humidity = 77.6
    
    # Log values being used for debugging
    print(f"Final values for PDF - Temperature: {temperature}°C, Humidity: {humidity}%")
    
    # Validate the image data is present and properly formatted
    if temperature_image:
        try:
            # Test that we can parse the image data
            if "data:image" in temperature_image:
                base64_part = temperature_image.split(',')[1]
                test_decode = base64.b64decode(base64_part)
                print("Temperature image validation successful")
            else:
                # Try to decode directly
                test_decode = base64.b64decode(temperature_image)
                print("Temperature image validation successful")
        except Exception as e:
            print(f"Temperature image validation failed: {e}")
            temperature_image = None
    
    if humidity_image:
        try:
            # Test that we can parse the image data
            if "data:image" in humidity_image:
                base64_part = humidity_image.split(',')[1]
                test_decode = base64.b64decode(base64_part)
                print("Humidity image validation successful")
            else:
                # Try to decode directly
                test_decode = base64.b64decode(humidity_image)
                print("Humidity image validation successful")
        except Exception as e:
            print(f"Humidity image validation failed: {e}")
            humidity_image = None
    
    # If force_white_background is True and we have images, process them to ensure they have white backgrounds
    if force_white_background:
        print("Forcing white background for chart images")
        if temperature_image is None or humidity_image is None:
            print("Cannot force white background - one or more images missing")
        else:
            # We will fall back to generating placeholder charts with known white backgrounds
            temperature_image = None
            humidity_image = None
    
    # Generate the PDF file with actual hive data
    pdf_path = create_hive_report_pdf(
        hive_id=hive_id, 
        temperature=temperature, 
        humidity=humidity,
        temperature_image=temperature_image,
        humidity_image=humidity_image,
        username=username,
        force_white_background=force_white_background,
        report_type=report_type
    )
    
    # Send the PDF
    url = f'https://api.telegram.org/bot{bot_token}/sendDocument'
    
    try:
        with open(pdf_path, 'rb') as pdf_file:
            files = {'document': pdf_file}
            data = {
                'chat_id': chat_id,
                'caption': f'Here is your Hive {hive_id} Health Report PDF'
            }
            
            response = requests.post(url, data=data, files=files)
            
            if response.status_code == 200:
                print("PDF sent successfully!")
                return True
            else:
                print(f"Failed to send PDF. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                return False
    except Exception as e:
        print(f"An error occurred while sending PDF: {e}")
        return False


if __name__ == "__main__":
    # Check if we have command-line arguments for hive data
    hive_id = None
    temperature = None
    humidity = None
    user_chat_id = None
    temperature_image = None
    humidity_image = None
    username = None
    send_now = False
    force_white_background = False
    report_type = None
    
    # If we have a command line argument, try to parse it as JSON data
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            hive_id = data.get('hiveId')
            temperature = data.get('temperature')
            humidity = data.get('humidity')
            user_chat_id = data.get('chatId')
            temperature_image = data.get('temperature_image')
            humidity_image = data.get('humidity_image')
            username = data.get('username')
            send_now = data.get('sendNow', False)
            force_white_background = data.get('forceWhiteBackground', False)
            report_type = data.get('reportType')
        except Exception as e:
            print(f"Error parsing JSON data: {e}")
    
    # Send PDF with the available data
    send_telegram_pdf(
        hive_id=hive_id, 
        temperature=temperature, 
        humidity=humidity, 
        user_chat_id=user_chat_id,
        temperature_image=temperature_image,
        humidity_image=humidity_image,
        username=username,
        send_now=send_now,
        force_white_background=force_white_background,
        report_type=report_type
    )