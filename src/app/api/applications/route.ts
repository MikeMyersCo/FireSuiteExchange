import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatSuiteName } from '@/lib/constants';

// POST /api/applications - Submit a new suite verification application
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { suiteArea, suiteNumber, legalName, message, attachments } = body;

    // Validation
    if (!suiteArea || !suiteNumber || !legalName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create the suite
    const displayName = formatSuiteName(suiteArea, suiteNumber);

    let suite = await db.suite.findFirst({
      where: {
        area: suiteArea,
        number: parseInt(suiteNumber),
      },
    });

    // Create suite if it doesn't exist
    if (!suite) {
      suite = await db.suite.create({
        data: {
          area: suiteArea,
          number: parseInt(suiteNumber),
          displayName,
          capacity: 8,
          isActive: true,
        },
      });
    }

    // Check if user already has an application for this suite
    const existingApplication = await db.sellerApplication.findFirst({
      where: {
        userId: session.user.id,
        suiteId: suite.id,
      },
    });

    if (existingApplication) {
      if (existingApplication.status === 'PENDING') {
        return NextResponse.json(
          { error: 'You already have a pending application for this suite' },
          { status: 400 }
        );
      }
      if (existingApplication.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'You are already verified for this suite' },
          { status: 400 }
        );
      }
      // If DENIED, allow reapplication
    }

    // Create the application
    const application = await db.sellerApplication.create({
      data: {
        userId: session.user.id,
        suiteId: suite.id,
        legalName,
        message: message || null,
        attachments: attachments || [],
        status: 'PENDING',
      },
      include: {
        suite: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email notification to admin about new application

    return NextResponse.json(
      {
        success: true,
        application: {
          id: application.id,
          status: application.status,
          suite: {
            displayName: application.suite.displayName,
            area: application.suite.area,
            number: application.suite.number,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating application:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You already have an application for this suite' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// GET /api/applications - Get all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins and approvers can view all applications
    const userRole = session.user.role as string;
    if (userRole !== 'ADMIN' && userRole !== 'APPROVER') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Approver access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const applications = await db.sellerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
