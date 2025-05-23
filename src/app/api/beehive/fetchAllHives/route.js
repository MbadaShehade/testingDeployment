import { NextResponse } from 'next/server';
import clientPromise from '@/app/_lib/mongodb';

export async function POST(request) {
  try {
    const { email } = await request.json();
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    // Find the user and his beehives
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return all beehives of the user
    return NextResponse.json({
      beehives: user.beehives || []
    });

  } catch (error) {
    console.error('Error fetching beehives:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 