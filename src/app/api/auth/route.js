import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';


export async function POST(request) {
  try {
    const { action, username, email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db('MoldInBeehives');
    const users = db.collection('users');

    if (action === 'signup') { //###################SIGNUP API REQUEST###################
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

      // Check if password is already used by another user
      const allUsers = await users.find({}).toArray();
      for (const user of allUsers) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          return NextResponse.json(
            { error: 'This password is already in use. Please choose a different password.' },
            { status: 400 }
          );
        }
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create new user with hashed password
      const result = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        telegramChatId: null
      });

      return NextResponse.json({ //SIGNUP API RESPONSE
        message: 'User created successfully',
        userId: result.insertedId 
      });

    } else if (action === 'login') { //###################LOGIN API REQUEST###################
      // Find user
      const user = await users.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found, Sign Up first' },
          { status: 401 }
        );
      }

      // Check username
      if (user.username !== username) {
        return NextResponse.json(
          { error: 'Invalid username' },
          { status: 401 }
        );
      }
      
      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      } 

      return NextResponse.json({ //LOGIN API RESPONSE
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