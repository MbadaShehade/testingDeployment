import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get data from request body
    const data = await request.json();
    const { 
      hiveId, 
      temperature, 
      humidity, 
      chatId, 
      temperature_image, 
      humidity_image, 
      username,
      sendNow 
    } = data;
    
    // If sendNow flag is set, use a different approach to get the latest data
    if (sendNow) {
      console.log('Sending immediate report for hive', hiveId);
      
      // In a real implementation, you would fetch real-time data from your database or IoT platform
      // For now, we'll use the python script to fetch the latest data
      
      const jsonData = JSON.stringify({ 
        hiveId: hiveId || null, 
        chatId: chatId || null,
        username: username || null,
        sendNow: true
      });
      
      // Execute a Python script to generate and send a PDF with the most recent data
      const pythonProcess = exec(`python telegram_bot.py '${jsonData}'`);
      
      return new Promise((resolve) => {
        pythonProcess.stdout.on('data', (data) => {
          console.log(`Python stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
          if (code === 0) {
            resolve(NextResponse.json({ 
              success: true, 
              message: 'Immediate Telegram PDF report sent successfully' 
            }));
          } else {
            resolve(NextResponse.json({ 
              success: false, 
              message: 'Failed to send immediate Telegram PDF report' 
            }, { status: 500 }));
          }
        });
      });
    }
    
    // Regular case: use the provided data
    // Prepare data to pass to Python script
    const jsonData = JSON.stringify({ 
      hiveId: hiveId || null, 
      temperature: temperature || null, 
      humidity: humidity || null,
      chatId: chatId || null,
      temperature_image: temperature_image || null,
      humidity_image: humidity_image || null,
      username: username || null
    });
    
    // Execute the Python script to send a PDF with the data
    const pythonProcess = exec(`python telegram_bot.py '${jsonData}'`);
    
    return new Promise((resolve) => {
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Telegram PDF report sent successfully' 
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            message: 'Failed to send Telegram PDF report' 
          }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error('Error executing Python script:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error executing Python script: ' + error.message 
    }, { status: 500 });
  }
} 