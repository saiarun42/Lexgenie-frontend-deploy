import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Read users from S3
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
      if (err.name === 'NoSuchKey' || (err.$metadata && err.$metadata.httpStatusCode === 404)) {
        users = [];
      } else {
        console.error('S3 read error on login:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Set cookie
    const response = NextResponse.json({});
    response.cookies.set(
      'auth-token',
      JSON.stringify({ userId: user.id, email: user.email }),
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      }
    );

    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
