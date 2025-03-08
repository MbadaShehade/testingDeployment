import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    const { action, username, email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    if (action === 'signup') {
      // Check if user already exists
      const existingUser = await users.findOne({ 
        $or: [{ email }] 
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 400 }
        );
      }

      // Create new user
      const result = await users.insertOne({
        username,
        email,
        password, // TO-DO: hash the password before storing
        createdAt: new Date()
      });

      return NextResponse.json({ 
        message: 'User created successfully',
        userId: result.insertedId 
      });

    } else if (action === 'login') {
      // Find user
      const user = await users.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      // Check password
      if (user.username !== username) {
        return NextResponse.json(
          { error: 'Invalid username' },
          { status: 401 }
        );
      }
      
      if (user.password !== password) { // TO-DO: compare hashed passwords
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      } 

      return NextResponse.json({
        message: 'Login successful',
        userId: user._id
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 