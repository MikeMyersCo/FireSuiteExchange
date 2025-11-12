import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/messages/mark-read - Mark a message (or all messages) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to mark messages as read' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, markAll } = body;

    if (!messageId && !markAll) {
      return NextResponse.json(
        { error: 'Either messageId or markAll must be provided' },
        { status: 400 }
      );
    }

    if (markAll) {
      // Mark all messages to this user as read
      await db.message.updateMany({
        where: {
          toUserId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All messages marked as read',
      });
    }

    // Mark a specific message as read
    const message = await db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Only the recipient can mark a message as read
    if (message.toUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only mark your own messages as read' },
        { status: 403 }
      );
    }

    await db.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
