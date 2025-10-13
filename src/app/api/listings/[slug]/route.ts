import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/listings/[slug] - Get a listing by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const listing = await db.listing.findUnique({
      where: { slug: params.slug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        suite: {
          select: {
            id: true,
            area: true,
            number: true,
            displayName: true,
            capacity: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.listing.update({
      where: { id: listing.id },
      data: { viewCount: listing.viewCount + 1 },
    });

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
