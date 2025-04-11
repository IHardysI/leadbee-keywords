import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" }, 
        { status: 400 }
      );
    }
    
    const finalUsername = username || email.split('@')[0];
    
    const client = await clerkClient() as any;
    const payload = {
      username: finalUsername,
      email_address: [email],
      password
    };

    const newUser = await client.users.createUser(payload);
    
    // Log the full response to understand the structure
    console.log("Clerk user response:", JSON.stringify(newUser, null, 2));
    
    // Return user with the correct email format
    return NextResponse.json({ 
      user: {
        id: newUser.id,
        username: newUser.username,
        email: email // Use the email from the request since we know it's valid
      } 
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    const errorMessage = error?.message || "Error creating user";
    const errorDetails = error?.response?.data || JSON.stringify(error, null, 2);
    return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 500 });
  }
} 