import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/listings/sell-tickets - Sell a specific quantity of tickets
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
    const { listingId, quantitySold, salePrice } = body;

    if (!listingId || !quantitySold) {
      return NextResponse.json(
        { error: 'Listing ID and quantity sold are required' },
        { status: 400 }
      );
    }

    // Validate quantity is a positive integer
    const qty = parseInt(quantitySold);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'Quantity sold must be a positive number' },
        { status: 400 }
      );
    }

    // Fetch the listing to verify ownership and current quantity
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

    // Check if listing is already fully sold
    if (listing.status === 'SOLD') {
      return NextResponse.json(
        { error: 'This listing is already marked as sold' },
        { status: 400 }
      );
    }

    // Validate quantity sold doesn't exceed available quantity
    if (qty > listing.quantity) {
      return NextResponse.json(
        { error: `Cannot sell ${qty} tickets. Only ${listing.quantity} available.` },
        { status: 400 }
      );
    }

    // Calculate new quantity
    const newQuantity = listing.quantity - qty;

    // Determine actual sale price (default to asking price if not provided)
    const actualSalePrice = salePrice !== undefined && salePrice !== null
      ? parseFloat(salePrice)
      : parseFloat(listing.pricePerSeat.toString()) * qty;

    // Validate sale price if provided
    if (salePrice !== undefined && salePrice !== null) {
      const price = parseFloat(salePrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Sale price must be a valid positive number' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      quantity: newQuantity,
    };

    // If all tickets are sold, mark as SOLD and store the sale price
    if (newQuantity === 0) {
      updateData.status = 'SOLD';
      updateData.soldAt = new Date();
      updateData.soldPriceTotal = actualSalePrice;
    }

    // Update the listing
    const updatedListing = await db.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    const message = newQuantity === 0
      ? `All ${qty} remaining tickets sold! Listing marked as sold.`
      : `${qty} ticket(s) sold. ${newQuantity} ticket(s) remaining.`;

    return NextResponse.json({
      success: true,
      message,
      listing: {
        id: updatedListing.id,
        quantity: updatedListing.quantity,
        status: updatedListing.status,
        soldAt: updatedListing.soldAt,
      },
    });
  } catch (error) {
    console.error('Error selling tickets:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}
