#!/bin/bash
#chmod +x start_scheduler.sh
#./start_scheduler.sh

# Kill any existing scheduler processes
pkill -f "python telegram_scheduler_mqtt.py"

# Start the scheduler in the background
nohup python telegram_scheduler_mqtt.py --hive_id 1 --chat_id 1234204680 --password test --username test > /dev/null 2>&1 &

# Print the process ID
echo "Scheduler started with PID: $!" 