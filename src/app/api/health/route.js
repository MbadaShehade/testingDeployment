import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    // Check MongoDB connection
    const client = await clientPromise;
    const isConnected = !!client && !!client.topology && client.topology.isConnected();
    
    if (isConnected) {
      return NextResponse.json({ 
        status: 'success',
        message: 'MongoDB connection successful',
        time: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        status: 'error',
        message: 'MongoDB connection failed - client exists but not connected' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'MongoDB connection failed',
      error: error.message
    }, { status: 500 });
  }
} 