import { NextResponse } from 'next/server';

// NOTE: Spawning Python scripts is not supported on Vercel serverless functions.
// This endpoint will only return a static response.

export async function POST(request) {
  return NextResponse.json({ 
    success: false, 
    error: 'Scheduler functionality is not supported on Vercel serverless functions.'
  });
}

/**
 * Handler for GET requests to check scheduler status
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hiveId = searchParams.get('hiveId');
  const chatId = searchParams.get('chatId');
  const action = searchParams.get('action');

  if (action === 'status') {
    // Placeholder for status check
    return NextResponse.json({ 
      success: false, 
      error: 'Scheduler functionality is not supported on Vercel serverless functions.'
    });
  }

  return NextResponse.json({ 
    success: false, 
    error: 'Invalid action' 
  });
}

/**
 * Fall back to direct command execution if API is not available
 */
async function executeSchedulerCommand(action, hiveId, chatId, username, testMode, reportTime, interval) {
  // Placeholder for command execution
  return NextResponse.json({ 
    success: false, 
    error: 'Scheduler functionality is not supported on Vercel serverless functions.'
  });
} 