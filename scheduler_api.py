import os
import json
import subprocess
import signal
import psutil
from flask import Flask, request, jsonify

app = Flask(__name__)

# Directory to store PID files for running schedulers
SCHEDULER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scheduler_pids")
os.makedirs(SCHEDULER_DIR, exist_ok=True)

def get_pid_file(chat_id, hive_id):
    """Generate a PID file name based on chat_id and hive_id"""
    # Sanitize inputs for filename
    safe_chat_id = str(chat_id).replace("/", "_").replace("\\", "_")
    safe_hive_id = str(hive_id).replace("/", "_").replace("\\", "_")
    return os.path.join(SCHEDULER_DIR, f"scheduler_{safe_chat_id}_{safe_hive_id}.pid")

def is_process_running(pid):
    """Check if a process with the given PID is running"""
    try:
        # Check if process exists
        process = psutil.Process(pid)
        return process.is_running()
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        return False

def read_pid_file(pid_file):
    """Read PID from file"""
    try:
        with open(pid_file, 'r') as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return None

def write_pid_file(pid_file, pid):
    """Write PID to file"""
    with open(pid_file, 'w') as f:
        f.write(str(pid))

def kill_process(pid):
    """Kill a process with the given PID"""
    try:
        os.kill(pid, signal.SIGTERM)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return False

@app.route('/api/scheduler/status', methods=['GET'])
def get_scheduler_status():
    """Get the status of scheduled reports for a specific hive and chat ID"""
    chat_id = request.args.get('chat_id')
    hive_id = request.args.get('hive_id')
    
    if not chat_id or not hive_id:
        return jsonify({"error": "Missing chat_id or hive_id parameter"}), 400
    
    pid_file = get_pid_file(chat_id, hive_id)
    pid = read_pid_file(pid_file)
    
    if pid is None:
        return jsonify({"status": "not_running"})
    
    is_running = is_process_running(pid)
    if not is_running:
        os.remove(pid_file)
        return jsonify({"status": "not_running"})
    
    return jsonify({
        "status": "running",
        "pid": pid
    })

@app.route('/api/scheduler/start', methods=['POST'])
def start_scheduler():
    """Start a scheduled report for a specific hive"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    chat_id = data.get('chat_id')
    hive_id = data.get('hive_id')
    username = data.get('username', 'User')
    test_mode = data.get('test_mode', False)
    report_time = data.get('report_time', '08:00')
    
    if not chat_id or not hive_id:
        return jsonify({"error": "Missing chat_id or hive_id parameter"}), 400
    
    # Check if already running
    pid_file = get_pid_file(chat_id, hive_id)
    existing_pid = read_pid_file(pid_file)
    
    if existing_pid and is_process_running(existing_pid):
        return jsonify({
            "status": "already_running",
            "pid": existing_pid
        })
    
    # Build command to start the scheduler
    cmd = [
        "python", "telegram_scheduler.py",
        "--hive_id", str(hive_id),
        "--chat_id", str(chat_id),
        "--username", username,
        "--time", report_time
    ]
    
    if test_mode:
        cmd.append("--test")
    
    # Start the scheduler process
    try:
        process = subprocess.Popen(cmd, 
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE,
                                   start_new_session=True)
        
        # Write PID to file
        write_pid_file(pid_file, process.pid)
        
        return jsonify({
            "status": "started",
            "pid": process.pid
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/scheduler/stop', methods=['POST'])
def stop_scheduler():
    """Stop a scheduled report for a specific hive"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    chat_id = data.get('chat_id')
    hive_id = data.get('hive_id')
    
    if not chat_id or not hive_id:
        return jsonify({"error": "Missing chat_id or hive_id parameter"}), 400
    
    pid_file = get_pid_file(chat_id, hive_id)
    pid = read_pid_file(pid_file)
    
    if pid is None:
        return jsonify({"status": "not_running"})
    
    # Try to kill the process
    success = kill_process(pid)
    
    if success:
        # Remove PID file
        try:
            os.remove(pid_file)
        except FileNotFoundError:
            pass
        
        return jsonify({
            "status": "stopped",
            "pid": pid
        })
    else:
        return jsonify({
            "status": "error",
            "error": "Failed to stop the scheduler process"
        }), 500

@app.route('/api/scheduler/list', methods=['GET'])
def list_schedulers():
    """List all running schedulers"""
    schedulers = []
    
    for filename in os.listdir(SCHEDULER_DIR):
        if filename.startswith("scheduler_") and filename.endswith(".pid"):
            pid_file = os.path.join(SCHEDULER_DIR, filename)
            pid = read_pid_file(pid_file)
            
            if pid is None:
                continue
            
            # Extract chat_id and hive_id from filename
            parts = filename.replace("scheduler_", "").replace(".pid", "").split("_")
            if len(parts) >= 2:
                chat_id = parts[0]
                hive_id = parts[1]
                
                is_running = is_process_running(pid)
                
                if not is_running:
                    # Clean up stale PID file
                    os.remove(pid_file)
                    continue
                
                schedulers.append({
                    "chat_id": chat_id,
                    "hive_id": hive_id,
                    "pid": pid,
                    "status": "running"
                })
    
    return jsonify({
        "schedulers": schedulers,
        "count": len(schedulers)
    })

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True) 