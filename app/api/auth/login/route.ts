import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import pool from '@/lib/db';
// import { RowDataPacket } from 'mysql2';

// Static credentials for testing
const STATIC_CREDENTIALS = {
  email: 'steve@iicl.in',
  password: '12345',
  id: 1,
  name: 'Steve Anthony'
};

// interface UserRow extends RowDataPacket {
//   id: number;
//   name: string;
//   email: string;
//   password: string;
// }

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Static authentication
    if (email !== STATIC_CREDENTIALS.email || password !== STATIC_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create response with static user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: STATIC_CREDENTIALS.id,
        name: STATIC_CREDENTIALS.name,
        email: STATIC_CREDENTIALS.email
      }
    });

    // Set authentication cookie in the response
    response.cookies.set('auth-token', JSON.stringify({ 
      userId: STATIC_CREDENTIALS.id, 
      email: STATIC_CREDENTIALS.email 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 