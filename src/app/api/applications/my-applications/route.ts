import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/applications/my-applications - Get current user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await db.sellerApplication.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        suite: {
          select: {
            id: true,
            area: true,
            number: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user's verified (approved) suite IDs for quick access
    const verifiedSuiteIds = applications
      .filter(app => app.status === 'APPROVED')
      .map(app => app.suiteId);

    return NextResponse.json({
      success: true,
      applications,
      verifiedSuiteIds,
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
