import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/applications/pending-count - Get count of pending applications
export async function GET() {
  try {
    const session = await auth();

    // Only APPROVERs and ADMINs can see this
    if (!session || (session.user.role !== 'APPROVER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const count = await db.sellerApplication.count({
      where: {
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending count' },
      { status: 500 }
    );
  }
}
