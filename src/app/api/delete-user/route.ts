import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const client = await clerkClient();
    const deletedUser = await client.users.deleteUser(userId);
    return NextResponse.json({ user: deletedUser });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 