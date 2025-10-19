import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/owners - Get all verified suite owners who opted in to directory
export async function GET() {
  try {
    // Get all users who have approved seller applications AND opted in to directory
    const approvedApplications = await db.sellerApplication.findMany({
      where: {
        status: 'APPROVED',
        user: {
          showInDirectory: true, // Only show users who opted in
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            showInDirectory: true,
          },
        },
        suite: {
          select: {
            area: true,
            number: true,
            displayName: true,
          },
        },
      },
    });

    // Group by user to consolidate their suites
    const ownersMap = new Map();

    approvedApplications.forEach((app) => {
      const userId = app.user.id;

      if (!ownersMap.has(userId)) {
        ownersMap.set(userId, {
          id: app.user.id,
          name: app.user.name,
          email: app.user.email,
          phone: app.user.phone,
          role: app.user.role,
          suites: [],
        });
      }

      ownersMap.get(userId).suites.push({
        area: app.suite.area,
        number: app.suite.number,
        displayName: app.suite.displayName,
      });
    });

    const owners = Array.from(ownersMap.values()).sort((a, b) => {
      // Sort by role (ADMIN first) then by name
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    return NextResponse.json({
      success: true,
      owners,
    });
  } catch (error) {
    console.error('Error fetching owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}
