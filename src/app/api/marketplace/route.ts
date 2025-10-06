import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

/**
 * API route for art marketplace operations
 * Handles purchasing, listing, and managing artwork sales
 */

// POST /api/marketplace/purchase - Purchase artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.contentId || !body.buyerAddress || !body.txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find content by ID
    const contentResults = await db
      .select()
      .from(schema.contents)
      .where(eq(schema.contents.id, body.contentId));
    
    if (contentResults.length === 0) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    const content = contentResults[0];
    
    // Check if artwork is for sale
    if (!content.isForSale || content.saleStatus !== 'available') {
      return NextResponse.json(
        { error: 'Artwork is not available for purchase' },
        { status: 400 }
      );
    }
    
    // Find seller (creator) by ID
    const sellerResults = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, content.creatorId));
    
    if (sellerResults.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Find buyer by address
    const buyerResults = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.address, body.buyerAddress));
    
    if (buyerResults.length === 0) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }
    
    // Begin transaction
    // In a real implementation, this would be wrapped in a database transaction
    
    // 1. Update content sale status
    await db
      .update(schema.contents)
      .set({
        saleStatus: 'sold',
        isForSale: false,
      })
      .where(eq(schema.contents.id, content.id));
    
    // 2. Record transaction
    const transactionResult = await db
      .insert(schema.transactions)
      .values({
        contentId: content.id,
        sellerId: content.creatorId,
        buyerId: buyerResults[0].id,
        price: content.price || '0',
        txHash: body.txHash,
        status: 'completed',
      })
      .returning({ id: schema.transactions.id });
    
    return NextResponse.json({
      success: true,
      transactionId: transactionResult[0].id,
      message: 'Artwork purchased successfully'
    });
  } catch (error) {
    console.error('Error purchasing artwork:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace - Get marketplace listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const artistId = searchParams.get('artistId');
    const status = searchParams.get('status') || 'available';
    
    // Build query with filters
    let query = db
      .select({
        content: schema.contents,
        creator: schema.users,
        artworkDetails: schema.artworkDetails,
      })
      .from(schema.contents)
      .leftJoin(schema.users, eq(schema.contents.creatorId, schema.users.id))
      .leftJoin(schema.artworkDetails, eq(schema.contents.id, schema.artworkDetails.contentId))
      .where(
        and(
          eq(schema.contents.isForSale, true),
          eq(schema.contents.saleStatus, status as any)
        )
      );
    
    // Apply category filter if provided
    if (category) {
      const categoryResults = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.name, category));
      
      if (categoryResults.length > 0) {
        query = query.where(eq(schema.contents.categoryId, categoryResults[0].id));
      }
    }
    
    // Apply artist filter if provided
    if (artistId) {
      query = query.where(eq(schema.contents.creatorId, parseInt(artistId)));
    }
    
    const results = await query;
    
    return NextResponse.json({ listings: results });
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/:id - Update artwork listing
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.contentId || !body.creatorAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find content by ID
    const contentResults = await db
      .select()
      .from(schema.contents)
      .where(eq(schema.contents.id, body.contentId));
    
    if (contentResults.length === 0) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }
    
    const content = contentResults[0];
    
    // Find creator by address
    const creatorResults = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.address, body.creatorAddress));
    
    if (creatorResults.length === 0) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }
    
    // Verify creator owns the content
    if (content.creatorId !== creatorResults[0].id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this artwork' },
        { status: 403 }
      );
    }
    
    // Update content listing
    await db
      .update(schema.contents)
      .set({
        price: body.price || content.price,
        isForSale: body.isForSale !== undefined ? body.isForSale : content.isForSale,
        saleStatus: body.saleStatus || content.saleStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.contents.id, content.id));
    
    // Update artwork details if provided
    if (body.artworkDetails) {
      // Check if artwork details exist
      const artworkDetailsResults = await db
        .select()
        .from(schema.artworkDetails)
        .where(eq(schema.artworkDetails.contentId, content.id));
      
      if (artworkDetailsResults.length > 0) {
        // Update existing artwork details
        await db
          .update(schema.artworkDetails)
          .set({
            medium: body.artworkDetails.medium || artworkDetailsResults[0].medium,
            dimensions: body.artworkDetails.dimensions || artworkDetailsResults[0].dimensions,
            edition: body.artworkDetails.edition || artworkDetailsResults[0].edition,
            editionCount: body.artworkDetails.editionCount || artworkDetailsResults[0].editionCount,
            isOriginal: body.artworkDetails.isOriginal !== undefined ? body.artworkDetails.isOriginal : artworkDetailsResults[0].isOriginal,
            createdYear: body.artworkDetails.createdYear || artworkDetailsResults[0].createdYear,
            materials: body.artworkDetails.materials || artworkDetailsResults[0].materials,
            framed: body.artworkDetails.framed !== undefined ? body.artworkDetails.framed : artworkDetailsResults[0].framed,
            frameDetails: body.artworkDetails.frameDetails || artworkDetailsResults[0].frameDetails,
            updatedAt: new Date(),
          })
          .where(eq(schema.artworkDetails.contentId, content.id));
      } else {
        // Create new artwork details
        await db
          .insert(schema.artworkDetails)
          .values({
            contentId: content.id,
            medium: body.artworkDetails.medium,
            dimensions: body.artworkDetails.dimensions,
            edition: body.artworkDetails.edition,
            editionCount: body.artworkDetails.editionCount,
            isOriginal: body.artworkDetails.isOriginal,
            createdYear: body.artworkDetails.createdYear,
            materials: body.artworkDetails.materials,
            framed: body.artworkDetails.framed,
            frameDetails: body.artworkDetails.frameDetails,
          });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Artwork listing updated successfully'
    });
  } catch (error) {
    console.error('Error updating artwork listing:', error);
    return NextResponse.json(
      { error: 'Failed to update artwork listing' },
      { status: 500 }
    );
  }
}