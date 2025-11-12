import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/messages/send - Send a message to a seller
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to send messages' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, message } = body;

    if (!listingId || !message) {
      return NextResponse.json(
        { error: 'Listing ID and message are required' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Fetch the listing to verify it exists and allows messages
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if seller allows messages
    if (!listing.allowMessages) {
      return NextResponse.json(
        { error: 'This seller does not accept messages through the platform' },
        { status: 403 }
      );
    }

    // Prevent sellers from messaging themselves
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot send messages to yourself' },
        { status: 400 }
      );
    }

    // Create the message
    const newMessage = await db.message.create({
      data: {
        listingId,
        fromUserId: session.user.id,
        toUserId: listing.sellerId,
        body: message.trim(),
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            eventTitle: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
