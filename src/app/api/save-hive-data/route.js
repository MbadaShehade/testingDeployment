import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export async function POST(request) {
  try {
    // Get data from request body
    const data = await request.json();
    const { hiveId, temperature, humidity } = data;
    
    if (!hiveId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing hiveId parameter' 
      }, { status: 400 });
    }
    
    // Create data object to save
    const hiveData = {
      temperature: temperature || null,
      humidity: humidity || null,
      timestamp: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(hiveData, null, 2);
    
    // Define the file path - we need to save it to the root directory
    // where the Python script will look for it
    const filePath = `hive_data_${hiveId}.json`;
    
    // Use a simple shell command to write the file to the root directory
    // since Next.js API routes run in a different context
    const escapedJson = jsonData.replace(/'/g, "\\'");
    const cmd = `echo '${escapedJson}' > ${filePath}`;
    
    return new Promise((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error saving hive data: ${error.message}`);
          resolve(NextResponse.json({ 
            success: false, 
            message: `Failed to save hive data: ${error.message}` 
          }, { status: 500 }));
          return;
        }
        
        if (stderr) {
          console.error(`Error output: ${stderr}`);
        }
        
        console.log(`Hive data saved to ${filePath}`);
        
        resolve(NextResponse.json({ 
          success: true, 
          message: 'Hive data saved successfully' 
        }));
      });
    });
    
  } catch (error) {
    console.error('Error saving hive data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving hive data: ' + error.message 
    }, { status: 500 });
  }
} 