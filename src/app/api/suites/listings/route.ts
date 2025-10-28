import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SuiteArea } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Map database SuiteArea to map Area type
function mapSuiteAreaToMapArea(area: SuiteArea): "LOWER" | "NORTH" | "SOUTH" {
  switch (area) {
    case 'L':
      return 'LOWER';
    case 'UNT':
      return 'NORTH';
    case 'UST':
      return 'SOUTH';
    default:
      return 'LOWER';
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');

    // Build where clause - show both ACTIVE and SOLD by default
    const where: any = {
      status: status || { in: ['ACTIVE', 'SOLD'] },
    };

    if (eventId) {
      where.id = eventId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Fetch active and sold listings
    const listings = await db.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        suite: true,
        images: {
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform listings - use listing ID as key to preserve all listings
    const suiteContacts: Record<string, any> = {};
    const highlightedSuites: string[] = [];

    for (const listing of listings) {
      const mapArea = mapSuiteAreaToMapArea(listing.suite.area);
      const suiteKey = `${mapArea}:${listing.suite.number}`;

      // Store contact information using listing ID as key (not suite key)
      suiteContacts[listing.id] = {
        contactEmail: listing.contactEmail || listing.seller.email,
        contactPhone: listing.contactPhone || listing.seller.phone,
        contactLink: listing.contactLink,
        contactMessenger: listing.contactMessenger,
        notes: listing.notes || `${listing.quantity} tickets available • $${listing.pricePerSeat} per seat`,
        listingId: listing.id,
        eventTitle: listing.eventTitle,
        eventDatetime: listing.eventDatetime.toISOString(),
        createdAt: listing.createdAt.toISOString(),
        quantity: listing.quantity,
        pricePerSeat: listing.pricePerSeat.toString(),
        deliveryMethod: listing.deliveryMethod,
        slug: listing.slug,
        suiteArea: listing.suite.area,
        suiteNumber: listing.suite.number,
        suiteDisplayName: listing.suite.displayName,
        status: listing.status,
        soldAt: listing.soldAt?.toISOString(),
        sellerId: listing.sellerId,
      };

      // Add to highlighted list
      if (!highlightedSuites.includes(suiteKey)) {
        highlightedSuites.push(suiteKey);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        contacts: suiteContacts,
        highlighted: highlightedSuites,
        disabled: [], // Can be populated based on sold listings or unavailable suites
      },
    });
  } catch (error) {
    console.error('Error fetching suite listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch suite listings',
      },
      { status: 500 }
    );
  }
}
