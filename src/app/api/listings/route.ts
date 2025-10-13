import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a seller or admin
    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You must be an approved seller to create listings' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      suiteId,
      eventTitle,
      eventDatetime,
      quantity,
      pricePerSeat,
      deliveryMethod,
      contactEmail,
      contactPhone,
      contactLink,
      contactMessenger,
      allowMessages,
      notes,
      seatNumbers,
    } = body;

    // Validation
    if (!suiteId || !eventTitle || !eventDatetime || !quantity || !pricePerSeat || !deliveryMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this suite - check for approved application
    const approvedApplication = await db.sellerApplication.findFirst({
      where: {
        userId: session.user.id,
        suiteId: suiteId,
        status: 'APPROVED',
      },
      include: {
        suite: true,
      },
    });

    if (!approvedApplication) {
      return NextResponse.json(
        { error: 'You do not have permission to list tickets for this suite. Please verify your ownership first.' },
        { status: 403 }
      );
    }

    // Generate slug from event title and datetime
    const slug = `${eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${Date.now()}`;

    // Create listing
    const listing = await db.listing.create({
      data: {
        sellerId: session.user.id,
        suiteId: suiteId,
        eventTitle,
        eventDatetime: new Date(eventDatetime),
        quantity: parseInt(quantity),
        pricePerSeat,
        deliveryMethod,
        contactEmail: contactEmail || session.user.email,
        contactPhone: contactPhone || null,
        contactLink: contactLink || null,
        contactMessenger: contactMessenger || null,
        allowMessages: allowMessages || false,
        notes: notes || null,
        seatNumbers: seatNumbers || null,
        status: 'ACTIVE',
        slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        listing: {
          id: listing.id,
          slug: listing.slug,
          eventTitle: listing.eventTitle,
          eventDatetime: listing.eventDatetime,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// GET /api/listings - Get all listings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const listings = await db.listing.findMany({
      where,
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
