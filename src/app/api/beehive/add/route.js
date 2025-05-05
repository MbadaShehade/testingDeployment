import { NextResponse } from 'next/server';
import clientPromise from '@/app/_lib/mongodb';

export async function POST(request) {
  try {
    const { groupId, hive , email} = await request.json();
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    // First try to find the user and their beehive group
    const result = await users.updateOne(
      { 
        email: email,
        'beehives.id': groupId 
      },
      {
        $push: {
          'beehives.$.hives': hive
        }
      }
    );

    if (result.modifiedCount === 0) {
      // If no document was modified, try to create a new beehive group for this user
      const createGroupResult = await users.updateOne(
        { email: email },
        {
          $push: {
            beehives: {
              id: groupId,
              hives: [hive]
            }
          }
        }
      );

      if (createGroupResult.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to add hive' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Hive added successfully',
      hive: hive
    });

  } catch (error) {
    console.error('Error adding hive:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 