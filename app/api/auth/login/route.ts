import { NextResponse } from 'next/server';

// Static credentials for testing
const STATIC_CREDENTIALS = {
  email: 'steve@iicl.in',
  password: '12345',
  id: 1,
  name: 'Steve Anthony'
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (email !== STATIC_CREDENTIALS.email || password !== STATIC_CREDENTIALS.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create response and set auth cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: STATIC_CREDENTIALS.id,
        name: STATIC_CREDENTIALS.name,
        email: STATIC_CREDENTIALS.email
      }
    });

    response.cookies.set('auth-token', JSON.stringify({
      userId: STATIC_CREDENTIALS.id,
      email: STATIC_CREDENTIALS.email
    }), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
