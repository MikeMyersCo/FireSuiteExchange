import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SuiteArea } from '@prisma/client';

// Map database SuiteArea to map Area type
function mapSuiteAreaToMapArea(area: SuiteArea): "LOWER" | "NORTH" | "SOUTH" {
  switch (area) {
    case 'LOWER_FIRE':
      return 'LOWER';
    case 'NORTH_TERRACE':
      return 'NORTH';
    case 'SOUTH_TERRACE':
      return 'SOUTH';
    default:
      return 'LOWER';
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status') || 'ACTIVE';

    // Build where clause
    const where: any = {
      status: status,
    };

    if (eventId) {
      where.id = eventId;
    }

    // Fetch active listings grouped by suite
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

    // Transform listings into map format
    const suiteContacts: Record<string, any> = {};
    const highlightedSuites: string[] = [];

    for (const listing of listings) {
      const mapArea = mapSuiteAreaToMapArea(listing.suite.area);
      const suiteKey = `${mapArea}:${listing.suite.number}`;

      // Store contact information
      suiteContacts[suiteKey] = {
        contactEmail: listing.contactEmail || listing.seller.email,
        contactPhone: listing.contactPhone || listing.seller.phone,
        contactLink: listing.contactLink,
        notes: listing.notes || `${listing.quantity} tickets available • $${listing.pricePerSeat} per seat`,
        listingId: listing.id,
        eventTitle: listing.eventTitle,
        eventDatetime: listing.eventDatetime.toISOString(),
        quantity: listing.quantity,
        pricePerSeat: listing.pricePerSeat.toString(),
        deliveryMethod: listing.deliveryMethod,
        slug: listing.slug,
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
