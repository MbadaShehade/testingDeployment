import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/_lib/mongodb';

export async function POST(request) {
  try {
    // Get data from request body
    const data = await request.json();
    const { hiveId, temperature, humidity, email } = data;
    
    if (!hiveId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing hiveId parameter' 
      }, { status: 400 });
    }
    
    // Create data object to save
    const hiveData = {
      hiveId,
      temperature: temperature || null,
      humidity: humidity || null,
      email: email || null,
      timestamp: new Date()
    };
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    const hiveDataCollection = db.collection('hive_data');
    
    // Update or insert data for this hive
    await hiveDataCollection.updateOne(
      { hiveId: hiveId }, 
      { $set: hiveData },
      { upsert: true }
    );
    
    console.log(`Hive data saved to MongoDB for hive ${hiveId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hive data saved successfully to database' 
    });
    
  } catch (error) {
    console.error('Error saving hive data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving hive data: ' + error.message 
    }, { status: 500 });
  }
} 