import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Load users.json from S3
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
      // if not found, start with empty array; otherwise error
      if (err.name === 'NoSuchKey' || (err.$metadata && err.$metadata.httpStatusCode === 404)) {
        users = [];
      } else {
        console.error('S3 read error on signup:', err);
        return NextResponse.json({ error: 'Internal server error (read)' }, { status: 500 });
      }
    }

    // Check if email exists
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Add new user; keep id as string for stable comparisons
    const newUser = { id: String(Date.now()), name, email, password };
    users.push(newUser);

    // Write updated users back to S3
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: USERS_FILE_KEY,
          Body: JSON.stringify(users, null, 2),
          ContentType: 'application/json',
        })
      );
    } catch (err) {
      console.error('S3 write error on signup:', err);
      return NextResponse.json({ error: 'Internal server error (write)' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err: any) {
    console.error('Signup Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
