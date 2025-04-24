import { NextResponse } from 'next/server';
import { monitorHiveConditions } from '@/app/utils/hiveMonitor';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { userId, hiveId } = await request.json();

    // Validate user and hive
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Monitor hive conditions and send report
    const result = await monitorHiveConditions(userId, hiveId);

    if (!result.success) {
      throw new Error(result.message);
    }

    return NextResponse.json({
      message: 'Hive monitoring report sent successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Hive monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to monitor hive conditions' },
      { status: 500 }
    );
  }
} 