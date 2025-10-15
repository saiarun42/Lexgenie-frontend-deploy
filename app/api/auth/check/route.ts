import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const USERS_FILE_KEY = 'users.json';

async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export async function GET() {
  try {
    // cookies() is synchronous
    const cookieStore=await(cookies() as any);
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse token value safely
    let tokenData;
    try {
      tokenData = JSON.parse(tokenCookie.value);
    } catch (e) {
      console.error('Invalid token error:', e);
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    if (!tokenData.userId || !tokenData.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Read users.json from S3
    let users: any[] = [];
    try {
      const data = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: USERS_FILE_KEY,
        })
      );
      const body = data.Body as Readable;
      const usersJson = await streamToString(body);
      users = usersJson.trim() ? JSON.parse(usersJson) : [];
    } catch (err: any) {
      // If object not found, treat as empty array; otherwise log and return error
      if (err.name === 'NoSuchKey' || (err.$metadata && err.$metadata.httpStatusCode === 404)) {
        users = [];
      } else {
        console.error('S3 read error:', err);
        return NextResponse.json({ error: 'Authentication failed (data load)' }, { status: 500 });
      }
    }

    // Find user
    const user = users.find(
      (u: any) => String(u.id) === String(tokenData.userId) && u.email === tokenData.email
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
