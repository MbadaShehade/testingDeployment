import { NextResponse } from 'next/server';
import clientPromise from '@/app/_lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse('Email is required', { status: 400 });
  }

  // Set up SSE headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = await clientPromise;
        const db = client.db('MoldInBeehives');
        const users = db.collection('users');

        // Set up change stream pipeline to watch changes for this user
        const pipeline = [
          {
            $match: {
              $or: [
                // For updates and inserts
                {
                  $and: [
                    { 'fullDocument.email': email },
                    { operationType: { $in: ['update', 'insert'] } }
                  ]
                },
                // For deletions
                {
                  $and: [
                    { 'documentKey._id': { $exists: true } },
                    { operationType: 'delete' }
                  ]
                }
              ]
            }
          }
        ];

        // Create change stream
        const changeStream = users.watch(pipeline, { 
          fullDocument: 'updateLookup'
        });

        // Send initial state
        const initialUser = await users.findOne({ email });
        const initialData = JSON.stringify({ 
          beehives: initialUser?.beehives || [{
            id: 1,
            hives: []
          }]
        });
        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

        // Listen for changes
        changeStream.on('change', async (change) => {
          try {
            // Handle different operation types
            if (change.operationType === 'delete') {
              // For deletions, send empty hive groups
              const data = JSON.stringify({
                beehives: [{
                  id: 1,
                  hives: []
                }]
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } else {
              // For updates and inserts, fetch latest data
              const user = await users.findOne({ email });
              const beehives = user?.beehives || [{
                id: 1,
                hives: []
              }];
              const data = JSON.stringify({ beehives });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          } catch (error) {
            console.error('Error processing change:', error);
            controller.error(error);
          }
        });

        // Handle errors
        changeStream.on('error', (error) => {
          console.error('Change stream error:', error);
          controller.error(error);
        });

        // Clean up when the connection is closed
        request.signal.addEventListener('abort', () => {
          changeStream.close();
        });
      } catch (error) {
        console.error('Stream initialization error:', error);
        controller.error(error);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 