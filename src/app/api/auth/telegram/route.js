import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    const { email, telegramChatId } = await request.json();
    
    if (!email || !telegramChatId) {
      return NextResponse.json(
        { error: 'Email and Telegram chat ID are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    // Find user and update with Telegram chat ID
    const updateResult = await users.updateOne(
      { email },
      { $set: { telegramChatId } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram chat ID updated successfully'
    });

  } catch (error) {
    console.error('Error updating Telegram chat ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API to get telegram chat ID for a user
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    // Find user and get their telegram chat ID
    const user = await users.findOne({ email }, { projection: { telegramChatId: 1 } });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      telegramChatId: user.telegramChatId || null
    });

  } catch (error) {
    console.error('Error getting Telegram chat ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 