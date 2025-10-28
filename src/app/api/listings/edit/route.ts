import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/listings/edit?id=[listingId] - Get listing data for editing
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch the listing
    const listing = await db.listing.findUnique({
      where: { id: listingId },
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

    // Check if user is the seller or an admin
    if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this listing' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        sellerId: listing.sellerId,
        suiteId: listing.suiteId,
        eventTitle: listing.eventTitle,
        eventDatetime: listing.eventDatetime,
        quantity: listing.quantity,
        pricePerSeat: listing.pricePerSeat.toString(),
        deliveryMethod: listing.deliveryMethod,
        contactEmail: listing.contactEmail,
        contactPhone: listing.contactPhone,
        contactLink: listing.contactLink,
        contactMessenger: listing.contactMessenger,
        allowMessages: listing.allowMessages,
        notes: listing.notes,
        seatNumbers: listing.seatNumbers,
        status: listing.status,
        slug: listing.slug,
      },
    });
  } catch (error) {
    console.error('Error fetching listing for edit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PUT /api/listings/edit - Update a listing
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      listingId,
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

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!suiteId || !eventTitle || !eventDatetime || quantity === undefined || !pricePerSeat || !deliveryMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the listing to verify ownership
    const listing = await db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller or an admin
    if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this listing' },
        { status: 403 }
      );
    }

    // Verify user owns this suite - check for approved application
    const approvedApplication = await db.sellerApplication.findFirst({
      where: {
        userId: session.user.id,
        suiteId: suiteId,
        status: 'APPROVED',
      },
    });

    if (!approvedApplication && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to list tickets for this suite.' },
        { status: 403 }
      );
    }

    // Update the listing
    const updatedListing = await db.listing.update({
      where: { id: listingId },
      data: {
        suiteId,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      listing: {
        id: updatedListing.id,
        slug: updatedListing.slug,
        eventTitle: updatedListing.eventTitle,
        eventDatetime: updatedListing.eventDatetime,
      },
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}
