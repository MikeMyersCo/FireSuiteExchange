import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// PATCH /api/applications/[id] - Approve or deny an application (admin only)
export async function PATCH(
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

    // Only admins and approvers can approve/deny applications
    if (session.user.role !== 'ADMIN' && session.user.role !== 'APPROVER') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Approver access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNote, deniedReason } = body;

    // Validation
    if (!status || !['APPROVED', 'DENIED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or DENIED' },
        { status: 400 }
      );
    }

    // Get the application
    const application = await db.sellerApplication.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        suite: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application
    const updatedApplication = await db.sellerApplication.update({
      where: { id: params.id },
      data: {
        status,
        adminNote: adminNote || null,
        deniedReason: status === 'DENIED' ? deniedReason || null : null,
        decidedAt: new Date(),
        verifiedAt: status === 'APPROVED' ? new Date() : null,
      },
    });

    // If approved, update user role to SELLER if not already
    if (status === 'APPROVED' && application.user.role === 'GUEST') {
      await db.user.update({
        where: { id: application.userId },
        data: { role: 'SELLER' },
      });
    }

    // TODO: Send email notification to user about decision

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// GET /api/applications/[id] - Get a specific application
export async function GET(
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

    const application = await db.sellerApplication.findUnique({
      where: { id: params.id },
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
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only allow user to view their own application or admins/approvers to view any
    if (application.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'APPROVER') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
