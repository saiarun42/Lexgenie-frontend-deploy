import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Static user data that matches our login
const STATIC_USER = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    let tokenData;
    try {
      tokenData = JSON.parse(token.value);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }
    
    // For static auth, just check if the token has the expected structure
    if (!tokenData.userId || !tokenData.email) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // In a real app, you would verify the token against a database
    // For static auth, we'll just return the static user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: STATIC_USER.id,
        email: STATIC_USER.email,
        name: STATIC_USER.name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}