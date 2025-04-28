import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Get data from request body
    const data = await request.json();
    const { 
      hiveId, 
      temperature_image, 
      humidity_image
    } = data;
    
    if (!hiveId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing hiveId parameter' 
      }, { status: 400 });
    }
    
    // Save temperature image if provided
    if (temperature_image) {
      const tempImagePath = path.join(process.cwd(), `temp_chart_${hiveId}.b64`);
      fs.writeFileSync(tempImagePath, temperature_image);
      console.log(`Saved temperature chart image for hive ${hiveId}`);
    }
    
    // Save humidity image if provided
    if (humidity_image) {
      const humidityImagePath = path.join(process.cwd(), `humidity_chart_${hiveId}.b64`);
      fs.writeFileSync(humidityImagePath, humidity_image);
      console.log(`Saved humidity chart image for hive ${hiveId}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Chart images saved successfully' 
    });
  } catch (error) {
    console.error('Error saving chart images:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving chart images: ' + error.message 
    }, { status: 500 });
  }
} 