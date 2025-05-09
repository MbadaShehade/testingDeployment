#!/bin/bash
#chmod +x python/start_scheduler.sh
#./python/start_scheduler.sh

# Kill any existing scheduler processes
pkill -f "python telegram_scheduler_mqtt.py"

# Start all user schedulers in the background
nohup python start_schedulers_for_all_users.py > /dev/null 2>&1 &

# Print the process ID
echo "All schedulers started with PID: $!" 