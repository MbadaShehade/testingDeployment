import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Flask API URL (should be in environment variables in a real app)
const SCHEDULER_API_URL = process.env.SCHEDULER_API_URL || 'http://localhost:5000/api/scheduler';

// Store active schedulers
const activeSchedulers = new Map();

/**
 * Handler for POST requests to start or stop the scheduler
 */
export async function POST(request) {
  try {
    const { action, hiveId, chatId, username, interval } = await request.json();

    if (action === 'start') {
      // Check if scheduler is already running for this hive
      if (activeSchedulers.has(hiveId)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Scheduler already running' 
        });
      }

      // Start the scheduler process
      const schedulerPath = path.join(process.cwd(), 'telegram_scheduler.py');
      const scheduler = spawn('python3', [
        schedulerPath,
        '--hive_id', hiveId,
        '--chat_id', chatId,
        '--username', username || 'User'
      ]);

      // Store the process
      activeSchedulers.set(hiveId, scheduler);

      // Handle process events
      scheduler.on('error', (err) => {
        console.error('Scheduler error:', err);
        activeSchedulers.delete(hiveId);
      });

      scheduler.on('exit', (code) => {
        console.log(`Scheduler exited with code ${code}`);
        activeSchedulers.delete(hiveId);
      });

      return NextResponse.json({ success: true });

    } else if (action === 'stop') {
      // Stop the scheduler for this hive
      const scheduler = activeSchedulers.get(hiveId);
      if (scheduler) {
        scheduler.kill();
        activeSchedulers.delete(hiveId);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ 
        success: false, 
        error: 'No active scheduler found' 
      });

    } else if (action === 'status') {
      // Check if scheduler is running for this hive
      const isRunning = activeSchedulers.has(hiveId);
      return NextResponse.json({ 
        success: true, 
        status: isRunning ? 'running' : 'stopped' 
      });

    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action' 
      });
    }

  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Handler for GET requests to check scheduler status
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hiveId = searchParams.get('hiveId');
  const chatId = searchParams.get('chatId');
  const action = searchParams.get('action');

  if (action === 'status') {
    const isRunning = activeSchedulers.has(hiveId);
    return NextResponse.json({ 
      success: true, 
      status: isRunning ? 'running' : 'stopped' 
    });
  }

  return NextResponse.json({ 
    success: false, 
    error: 'Invalid action' 
  });
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
    } else if (action === 'update') {
      // For updating interval, we need to stop the current scheduler and start a new one
      try {
        // First, stop the current scheduler
        await execAsync(`pkill -f "telegram_scheduler.py.*hive_id ${hiveId}.*chat_id ${chatId}"`);
        
        // Then start a new one with the updated interval
        let command = `python telegram_scheduler.py --hive_id "${hiveId}" --chat_id "${chatId}"`;
        
        if (username) {
          command += ` --username "${username}"`;
        }
        
        if (reportTime) {
          command += ` --time "${reportTime}"`;
        }
        
        // Add the new interval parameter
        if (interval) {
          command += ` --interval "${interval}"`;
        }
        
        // Start the command in the background
        command += ' &';
        
        await execAsync(command);
        return NextResponse.json({ 
          status: 'updated', 
          interval: interval || '24h',
          message: 'Scheduler updated via command line' 
        });
      } catch (err) {
        console.error('Error updating scheduler:', err);
        return NextResponse.json({ 
          error: 'Failed to update scheduler',
          details: err.message 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error executing scheduler command:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 