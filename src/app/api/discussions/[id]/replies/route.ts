import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/discussions/[id]/replies - Add a reply to a discussion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only verified sellers (SELLER+) can reply
    if (session.user.role === 'GUEST') {
      return NextResponse.json(
        { error: 'You must be a verified suite owner to reply to discussions' },
        { status: 403 }
      );
    }

    const { id: discussionId } = params;
    const body = await request.json();
    const { content } = body;

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Reply must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    // Check if discussion exists and is not locked
    const discussion = await db.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    if (discussion.isLocked) {
      return NextResponse.json(
        { error: 'This discussion is locked and cannot accept new replies' },
        { status: 403 }
      );
    }

    // Create reply and update discussion
    const [reply] = await db.$transaction([
      db.discussionReply.create({
        data: {
          discussionId,
          authorId: session.user.id,
          content,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      db.discussion.update({
        where: { id: discussionId },
        data: {
          replyCount: {
            increment: 1,
          },
          lastActivityAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        reply,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
