import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/discussions/[id] - Get single discussion with all replies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const discussion = await db.discussion.findUnique({
      where: { id },
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.discussion.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}
