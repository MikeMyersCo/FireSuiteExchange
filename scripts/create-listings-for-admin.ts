import { PrismaClient } from '@prisma/client';
import { EVENTS_2026 } from '../src/lib/events-2026';

const prisma = new PrismaClient();

// Generate random price between $75 and $150 in $5 increments
function generatePrice(): number {
  const min = 75;
  const max = 150;
  const increment = 5;
  const steps = (max - min) / increment;
  const randomStep = Math.floor(Math.random() * (steps + 1));
  return min + (randomStep * increment);
}

async function createListingsForAdmin() {
  try {
    console.log('🎫 Creating listings for admin user...\n');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'mikemyersco@gmail.com' }
    });

    if (!user) {
      console.error('❌ User mikemyersco@gmail.com not found!');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Find suite UNT1 (Upper North Terrace #1)
    const suite = await prisma.suite.findFirst({
      where: {
        area: 'UNT',
        number: 1
      }
    });

    if (!suite) {
      console.error('❌ Suite UNT1 not found!');
      return;
    }

    console.log(`✅ Found suite: ${suite.displayName} (ID: ${suite.id})`);

    // Check if user already has an approved application for this suite
    let application = await prisma.sellerApplication.findFirst({
      where: {
        userId: user.id,
        suiteId: suite.id,
        status: 'APPROVED'
      }
    });

    // Create approved application if it doesn't exist
    if (!application) {
      application = await prisma.sellerApplication.create({
        data: {
          userId: user.id,
          suiteId: suite.id,
          status: 'APPROVED',
          legalName: user.name || 'Admin User',
          message: 'Admin user application - auto-approved',
          verifiedAt: new Date(),
          decidedAt: new Date()
        }
      });
      console.log(`✅ Created approved seller application for ${suite.displayName}`);
    } else {
      console.log(`✅ Approved seller application already exists for ${suite.displayName}`);
    }

    console.log('\n📝 Creating listings for all concerts...\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const event of EVENTS_2026) {
      // Check if listing already exists for this event
      const existingListing = await prisma.listing.findFirst({
        where: {
          sellerId: user.id,
          suiteId: suite.id,
          eventTitle: event.artist
        }
      });

      if (existingListing) {
        console.log(`⏭️  Skipped: ${event.artist} (already exists)`);
        skippedCount++;
        continue;
      }

      // Generate slug
      const slug = `${event.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suite.displayName.toLowerCase()}-${new Date(event.date).getTime()}`;

      // Generate varied price for this listing
      const price = generatePrice();

      // Create listing
      await prisma.listing.create({
        data: {
          sellerId: user.id,
          suiteId: suite.id,
          eventTitle: event.artist,
          eventDatetime: new Date(event.date),
          quantity: 8, // Full suite capacity - 8 seats
          pricePerSeat: price, // Varied price between $75-$150
          deliveryMethod: 'MOBILE_TRANSFER',
          contactEmail: user.email || '',
          contactPhone: '(555) 123-4567',
          allowMessages: true,
          status: 'ACTIVE',
          slug: slug,
          seatNumbers: '1, 2, 3, 4, 5, 6, 7, 8', // All 8 seat numbers
          notes: 'Suite seats with excellent view of the stage. Includes access to suite amenities.'
        }
      });

      console.log(`✅ Created: ${event.artist} - ${new Date(event.date).toLocaleDateString()} - $${price}/seat`);
      createdCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Listing creation complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Created: ${createdCount} listings`);
    console.log(`⏭️  Skipped: ${skippedCount} listings (already existed)`);
    console.log(`📍 Suite: ${suite.displayName} (Upper North Terrace #1)`);
    console.log(`👤 User: ${user.email}`);
    console.log(`💰 Price: $75-$150 per seat (varied)`);
    console.log(`🎟️  Quantity: 8 seats per listing (full suite)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating listings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createListingsForAdmin();
