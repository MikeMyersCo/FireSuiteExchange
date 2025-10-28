import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/listings/mark-sold - Toggle listing status between sold and active
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, status, quantity } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && status !== 'SOLD' && status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid status. Must be SOLD or ACTIVE' },
        { status: 400 }
      );
    }

    // Validate quantity if provided (when marking as available)
    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Fetch the listing to verify ownership
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller or an admin
    if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to modify this listing' },
        { status: 403 }
      );
    }

    // Determine the new status
    let newStatus = status;
    if (!newStatus) {
      // Toggle: if currently SOLD, mark as ACTIVE; if ACTIVE, mark as SOLD
      newStatus = listing.status === 'SOLD' ? 'ACTIVE' : 'SOLD';
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
    };

    // Set soldAt when marking as sold, clear it when marking as available
    if (newStatus === 'SOLD') {
      updateData.soldAt = new Date();
      // If explicitly marking as sold with quantity 0
      if (quantity !== undefined) {
        updateData.quantity = 0;
      }
    } else if (newStatus === 'ACTIVE') {
      updateData.soldAt = null;
      // When marking as available, restore the quantity if provided
      if (quantity !== undefined) {
        updateData.quantity = parseInt(quantity);
      }
    }

    // Update the listing
    const updatedListing = await db.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    const message = newStatus === 'SOLD'
      ? 'Listing marked as sold successfully'
      : 'Listing marked as available successfully';

    return NextResponse.json({
      success: true,
      message,
      listing: {
        id: updatedListing.id,
        status: updatedListing.status,
        soldAt: updatedListing.soldAt,
      },
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
}
