import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/messages - Get all messages for the current user (inbox + sent)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view messages' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'inbox', 'sent'

    // Build the query based on type
    let whereClause: any = {};

    if (type === 'inbox') {
      whereClause = { toUserId: session.user.id };
    } else if (type === 'sent') {
      whereClause = { fromUserId: session.user.id };
    } else {
      // 'all' - get both inbox and sent
      whereClause = {
        OR: [
          { toUserId: session.user.id },
          { fromUserId: session.user.id },
        ],
      };
    }

    // Fetch messages
    const messages = await db.message.findMany({
      where: whereClause,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        toUser: {
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
            status: true,
            suite: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Count unread messages (only inbox)
    const unreadCount = await db.message.count({
      where: {
        toUserId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
