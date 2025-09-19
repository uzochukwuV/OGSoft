import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * API route for content operations
 * Handles creating, updating, and retrieving content
 */

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.rootHash || !body.creatorAddress || !body.networkType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find user by address
    const userResults = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.address, body.creatorAddress));
    
    if (userResults.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResults[0];
    
    // Insert content into database
    const result = await db.insert(schema.contents).values({
      creatorId: user.id,
      title: body.title,
      description: body.description || '',
      contentType: body.contentType || 'image',
      categoryId: body.categoryId,
      thumbnailUrl: body.thumbnailUrl,
      price: body.price,
      rootHash: body.rootHash,
      txHash: body.txHash,
      networkType: body.networkType,
      fileSize: body.fileSize,
      fileName: body.fileName,
      mimeType: body.mimeType,
    }).returning({ id: schema.contents.id });
    
    // Update user type to creator or both if not already
    if (user.userType === 'collector') {
      await db
        .update(schema.users)
        .set({ userType: 'both' })
        .where(eq(schema.users.id, user.id));
    }
    
    return NextResponse.json({
      success: true,
      contentId: result[0].id
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// GET /api/content - Get all content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorAddress = searchParams.get('creatorAddress');
    
    var query: any = db.select().from(schema.contents);
    
    // Filter by creator address if provided
    if (creatorAddress) {
      const userResults = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.address, creatorAddress));
      
      if (userResults.length > 0) {
        query = db
          .select()
          .from(schema.contents)
          .where(eq(schema.contents.creatorId, userResults[0].id));
      } else {
        return NextResponse.json({ contents: [] });
      }
    }
    
    const contents = await query;
    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}