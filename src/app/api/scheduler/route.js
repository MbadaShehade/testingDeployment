import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Flask API URL (should be in environment variables in a real app)
const SCHEDULER_API_URL = process.env.SCHEDULER_API_URL || 'http://localhost:5000/api/scheduler';

/**
 * Handler for POST requests to start or stop the scheduler
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, hiveId, chatId, username, testMode, reportTime, interval } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    if (!hiveId || !chatId) {
      return NextResponse.json({ error: 'Missing hiveId or chatId parameter' }, { status: 400 });
    }

    // Determine which API endpoint to call based on action
    let endpoint = '';
    let payload = {};

    switch (action) {
      case 'start':
        endpoint = `${SCHEDULER_API_URL}/start`;
        payload = {
          hive_id: hiveId,
          chat_id: chatId,
          username: username || 'User',
          test_mode: testMode || false,
          report_time: reportTime || '08:00',
          interval: interval || '24h'
        };
        break;
      case 'stop':
        endpoint = `${SCHEDULER_API_URL}/stop`;
        payload = {
          hive_id: hiveId,
          chat_id: chatId
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // If the Flask API is running, use it
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // If API call fails, fall back to direct command execution
        return await executeSchedulerCommand(action, hiveId, chatId, username, testMode, reportTime, interval);
      }
    } catch (error) {
      // If API is not available, fall back to direct command execution
      console.error('Error calling scheduler API:', error);
      return await executeSchedulerCommand(action, hiveId, chatId, username, testMode, reportTime, interval);
    }
  } catch (error) {
    console.error('Error in scheduler API route:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Handler for GET requests to check scheduler status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hiveId = searchParams.get('hiveId');
    const chatId = searchParams.get('chatId');
    const action = searchParams.get('action') || 'status';

    if (!hiveId || !chatId) {
      return NextResponse.json({ error: 'Missing hiveId or chatId parameter' }, { status: 400 });
    }

    let endpoint = '';
    switch (action) {
      case 'status':
        endpoint = `${SCHEDULER_API_URL}/status?hive_id=${hiveId}&chat_id=${chatId}`;
        break;
      case 'list':
        endpoint = `${SCHEDULER_API_URL}/list`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // For demonstration purposes, we'll simulate a successful status response
        // In a real application, you'd want to have a more robust status tracking system
        if (action === 'status') {
          // Check local storage or filesystem if a job is running for this hive/chat combo
          // This is a simplified version for demonstration
          try {
            const { stdout } = await execAsync(`ps aux | grep "telegram_scheduler.py.*hive_id ${hiveId}.*chat_id ${chatId}" | grep -v grep`);
            
            if (stdout.trim()) {
              // Extract interval from the running process if possible
              const intervalMatch = stdout.match(/--interval\s+["']?(\w+)["']?/);
              const interval = intervalMatch ? intervalMatch[1] : '24h';
              
              return NextResponse.json({ 
                status: 'running',
                interval: interval,
                message: 'Scheduler is running via command line'
              });
            } else {
              return NextResponse.json({ 
                status: 'stopped',
                message: 'No scheduler found for this hive'
              });
            }
          } catch (err) {
            // If grep returns no results, it exits with code 1, which throws an error
            return NextResponse.json({ 
              status: 'stopped',
              message: 'No scheduler found for this hive'
            });
          }
        }
        
        return NextResponse.json({ error: 'Failed to get scheduler status' }, { status: response.status });
      }
    } catch (error) {
      console.error('Error calling scheduler API:', error);
      return NextResponse.json({ status: 'unknown', error: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in scheduler API route:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * Fall back to direct command execution if API is not available
 */
async function executeSchedulerCommand(action, hiveId, chatId, username, testMode, reportTime, interval) {
  try {
    if (action === 'start') {
      // Try to fetch and save current hive data
      try {
        // Create a JSON string with default values that will be updated by real data in the scheduler
        const hiveData = {
          temperature: 24.9, // Default values closer to what's shown in the UI
          humidity: 68.9,    // Default values closer to what's shown in the UI
          timestamp: new Date().toISOString()
        };
        
        const jsonData = JSON.stringify(hiveData, null, 2);
        const escapedJson = jsonData.replace(/'/g, "\\'");
        
        // Save the data to a file that telegram_bot.py will read
        await execAsync(`echo '${escapedJson}' > hive_data_${hiveId}.json`);
        
        console.log(`Saved initial hive data for hive ${hiveId}`);
      } catch (saveError) {
        console.error('Error saving initial hive data:', saveError);
        // Continue even if saving fails
      }
      
      // Construct command to start the scheduler
      let command = `python telegram_scheduler.py --hive_id "${hiveId}" --chat_id "${chatId}"`;
      
      if (username) {
        command += ` --username "${username}"`;
      }
      
      if (reportTime) {
        command += ` --time "${reportTime}"`;
      }
      
      if (testMode) {
        command += ' --test';
      }
      
      // Add interval parameter
      if (interval) {
        command += ` --interval "${interval}"`;
      }
      
      // Start the command in the background
      command += ' &';
      
      await execAsync(command);
      return NextResponse.json({ 
        status: 'started', 
        interval: interval || '24h',
        message: 'Scheduler started via command line' 
      });
    } else if (action === 'stop') {
      // We would need a more complex solution to stop the scheduler via command line
      // A simple approach is to kill the process running the scheduler for this hive/chat combo
      try {
        await execAsync(`pkill -f "telegram_scheduler.py.*hive_id ${hiveId}.*chat_id ${chatId}"`);
        return NextResponse.json({ 
          status: 'stopped',
          message: 'Scheduler stopped via command line'
        });
      } catch (err) {
        // If no process is found, pkill exits with code 1
        return NextResponse.json({ 
          status: 'already_stopped',
          message: 'No scheduler was running for this hive'
        });
      }
    }
  } catch (error) {
    console.error('Error executing scheduler command:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 