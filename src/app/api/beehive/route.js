import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    const { email, groupNumber, hiveNumber, position } = await request.json();
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    // Find the user
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the hive already exists for this user
    const existingHive = await users.findOne({
      email,
      'beehives.groupNumber': groupNumber,
      'beehives.hives.hiveNumber': hiveNumber
    });

    if (existingHive) {      
      return NextResponse.json({
        message: 'Hive found',
        hive: existingHive,
        isExisting: true
      });
    }

    // If hive doesn't exist, create new hive data
    const newHive = {
      hiveNumber: hiveNumber,
      name: `Hive ${hiveNumber}`,
      position: position,
      hasAlert: false,
      humidity: null,
      temperature: null
    };

   
    result = await users.updateOne(
        { 
          email, 
          'beehives.groupNumber': groupNumber 
        },
        {
          $push: {
            'beehives.$.hives': newHive
          }
        }
    );
    
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to add hive' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Hive added successfully',
      hive: newHive,
      isExisting: true
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 