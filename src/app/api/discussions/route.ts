import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/discussions - Get all discussions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const where: any = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    const discussions = await db.discussion.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      success: true,
      discussions: discussions.map(d => ({
        ...d,
        replyCount: d.replies.length,
        replies: undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

// POST /api/discussions - Create a new discussion
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only verified sellers (SELLER+) can create discussions
    if (session.user.role === 'GUEST') {
      return NextResponse.json(
        { error: 'You must be a verified suite owner to create discussions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.length < 20 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 20 and 5000 characters' },
        { status: 400 }
      );
    }

    // Create discussion
    const discussion = await db.discussion.create({
      data: {
        authorId: session.user.id,
        title,
        content,
        category: category || 'General',
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
    });

    return NextResponse.json(
      {
        success: true,
        discussion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
