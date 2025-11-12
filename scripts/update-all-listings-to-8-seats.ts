import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllListingsTo8Seats() {
  try {
    console.log('🔄 Updating all listings to have 8 seats...\n');

    // Get all active listings
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        seller: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 Found ${listings.length} active listings to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const listing of listings) {
      if (listing.quantity === 8) {
        console.log(`⏭️  Skipped: ${listing.eventTitle} (already has 8 seats)`);
        skippedCount++;
        continue;
      }

      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          quantity: 8,
          seatNumbers: '1, 2, 3, 4, 5, 6, 7, 8'
        }
      });

      console.log(`✅ Updated: ${listing.eventTitle} (${listing.quantity} → 8 seats)`);
      updatedCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Update complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated: ${updatedCount} listings`);
    console.log(`⏭️  Skipped: ${skippedCount} listings (already had 8 seats)`);
    console.log(`📊 Total active listings: ${listings.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error updating listings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllListingsTo8Seats();
