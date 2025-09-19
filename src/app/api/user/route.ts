import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user?address={address}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
      with: {
        socials: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// POST /api/user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, displayName, bio, avatarUrl, coverUrl, userType } = body;

    

    if (!address || !username) {
      return NextResponse.json({ error: 'Address and username are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (!existingUser) {
      const updatedUser = await db.insert(users)
      .values({
        address,
        username,
        displayName,
        bio,
        avatarUrl,
        coverUrl,
        userType: userType || 'collector',
      })
      .returning();
      return NextResponse.json({ user: updatedUser[0] }, { status: 200 });
    }

    // Create new user
    const newUser = await db.insert(users).values({
      address,
      username,
      displayName,
      bio,
      avatarUrl,
      coverUrl,
      userType: userType || 'collector',
    }).returning();

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, displayName, bio, avatarUrl, coverUrl, userType } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

   if (!existingUser) {
      const updatedUser = await db.insert(users)
      .values({
        address,
        username,
        displayName,
        bio,
        avatarUrl,
        coverUrl,
        userType: userType || 'collector',
      })
      .returning();
      return NextResponse.json({ user: updatedUser[0] }, { status: 200 });
    }

    // Update user
    const updatedUser = await db.update(users)
      .set({
        username: username || existingUser.username,
        displayName,
        bio,
        avatarUrl,
        coverUrl,
        userType: userType || existingUser.userType,
        updatedAt: new Date(),
      })
      .where(eq(users.address, address))
      .returning();

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}