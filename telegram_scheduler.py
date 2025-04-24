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

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("telegram_scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("telegram_scheduler")

# Global flag to indicate when to shut down
should_stop = False

def signal_handler(sig, frame):
    """Handle termination signals to clean up properly"""
    global should_stop
    logger.info("Received termination signal. Gracefully shutting down...")
    should_stop = True

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def send_report(hive_id, chat_id, username=None):
    """Send a PDF report using the telegram_bot.py script"""
    logger.info(f"Sending scheduled report for hive {hive_id} to chat {chat_id}")
    
    # Prepare data for the report
    data = {
        "hiveId": hive_id,
        "chatId": chat_id,
        "username": username,
        "sendNow": True  # Flag to get the latest data
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

def parse_time(time_str):
    """Parse time string in HH:MM format and return today's datetime with that time"""
    hours, minutes = map(int, time_str.split(':'))
    now = datetime.now()
    target_time = now.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    return target_time

def seconds_until(target_time):
    """Calculate seconds until the target time. If target is in the past, calculate for tomorrow."""
    now = datetime.now()
    if target_time < now:
        # Target time is in the past, schedule for tomorrow
        seconds = 24*60*60 - (now - target_time).total_seconds()
    else:
        # Target time is today
        seconds = (target_time - now).total_seconds()
    return max(0, seconds)

def run_scheduler(hive_id, chat_id, username=None, test_mode=False, report_time="08:00", interval="24h"):
    """Run the scheduler loop"""
    global should_stop
    
    logger.info(f"Starting scheduler for hive {hive_id}")
    logger.info(f"Settings: test_mode={test_mode}, report_time={report_time}, interval={interval}")
    
    # Determine the sleep interval in seconds
    if test_mode:
        sleep_seconds = 15  # Test mode: 15 seconds
    elif interval == "15s":
        sleep_seconds = 15  # 15 seconds
    elif interval == "1h":
        sleep_seconds = 3600  # 1 hour
    else:  # "24h" is default
        # Calculate time until scheduled report
        target_time = parse_time(report_time)
        sleep_seconds = seconds_until(target_time)
        logger.info(f"Scheduled for {target_time}, which is in {sleep_seconds:.1f} seconds")
    
    # Main loop
    first_run = True
    while not should_stop:
        # For intervals of 24h, recalculate seconds until target time each iteration
        if interval == "24h" and not test_mode:
            if not first_run:
                target_time = parse_time(report_time)
                sleep_seconds = seconds_until(target_time)
                logger.info(f"Next run scheduled for {target_time}, which is in {sleep_seconds:.1f} seconds")

        logger.info(f"Waiting {sleep_seconds:.1f} seconds until next report...")
        
        # Sleep in small increments to check for stop signal
        remaining = sleep_seconds
        while remaining > 0 and not should_stop:
            time.sleep(min(1, remaining))
            remaining -= 1
            
        if should_stop:
            break
            
        # Send the report
        success = send_report(hive_id, chat_id, username)
        if success:
            logger.info("Report sent successfully")
        else:
            logger.error("Failed to send report")
            
        first_run = False
            
    logger.info("Scheduler stopped.")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Schedule beehive reports to be sent via Telegram')
    parser.add_argument('--hive_id', required=True, help='Hive ID for the report')
    parser.add_argument('--chat_id', required=True, help='Telegram chat ID to send reports to')
    parser.add_argument('--username', help='Username to include in the report')
    parser.add_argument('--test', action='store_true', help='Test mode: send reports every 15 seconds')
    parser.add_argument('--time', default='08:00', help='Daily report time in HH:MM format (default: 08:00)')
    parser.add_argument('--interval', default='24h', choices=['15s', '1h', '24h'], 
                       help='Report interval: 15s, 1h, or 24h (default: 24h)')
    
    args = parser.parse_args()
    
    try:
        # Log startup
        logger.info(f"Starting scheduler process with PID {os.getpid()}")
        logger.info(f"Arguments: {args}")
        
        # Run the scheduler with the specified parameters
        run_scheduler(
            args.hive_id, 
            args.chat_id, 
            username=args.username,
            test_mode=args.test,
            report_time=args.time,
            interval=args.interval
        )
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main() 