import { PrismaClient, SuiteArea, UserRole, ListingStatus, DeliveryMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('📦 Cleaning existing data...');
  await prisma.message.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.notificationPref.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.suite.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Data cleaned\n');

  // Create all 130 suites
  console.log('🏟️  Creating suites...');

  const suites = [];

  // North Terrace Suites 1-20
  for (let i = 1; i <= 20; i++) {
    suites.push({
      area: SuiteArea.NORTH_TERRACE,
      number: i,
      capacity: 8,
      isActive: true,
    });
  }

  // South Terrace Suites 1-20
  for (let i = 1; i <= 20; i++) {
    suites.push({
      area: SuiteArea.SOUTH_TERRACE,
      number: i,
      capacity: 8,
      isActive: true,
    });
  }

  // Lower Fire Suites 1-90
  for (let i = 1; i <= 90; i++) {
    suites.push({
      area: SuiteArea.LOWER_FIRE,
      number: i,
      capacity: 8,
      isActive: true,
    });
  }

  await prisma.suite.createMany({
    data: suites,
  });

  console.log(`✓ Created ${suites.length} suites\n`);

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@firesuite.exchange',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      name: 'System Admin',
      phone: '719-555-0100',
      emailVerified: new Date(),
    },
  });

  await prisma.notificationPref.create({
    data: {
      userId: admin.id,
      emailEnabled: true,
      smsEnabled: false,
    },
  });

  console.log('✓ Admin created');
  console.log(`  Email: admin@firesuite.exchange`);
  console.log(`  Password: Admin123!\n`);

  // Create sample seller
  console.log('👤 Creating sample seller...');
  const sellerPassword = await bcrypt.hash('Seller123!', 12);
  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash: sellerPassword,
      role: UserRole.SELLER,
      name: 'John Smith',
      phone: '719-555-0101',
      emailVerified: new Date(),
    },
  });

  await prisma.notificationPref.create({
    data: {
      userId: seller.id,
      emailEnabled: true,
      smsEnabled: false,
    },
  });

  console.log('✓ Seller created');
  console.log(`  Email: seller@example.com`);
  console.log(`  Password: Seller123!\n`);

  // Create sample guest user
  console.log('👤 Creating sample guest...');
  const guestPassword = await bcrypt.hash('Guest123!', 12);
  const guest = await prisma.user.create({
    data: {
      email: 'guest@example.com',
      passwordHash: guestPassword,
      role: UserRole.GUEST,
      name: 'Jane Doe',
      emailVerified: new Date(),
    },
  });

  await prisma.notificationPref.create({
    data: {
      userId: guest.id,
      emailEnabled: true,
      smsEnabled: false,
    },
  });

  console.log('✓ Guest created');
  console.log(`  Email: guest@example.com`);
  console.log(`  Password: Guest123!\n`);

  // Get a suite for the seller
  const sellerSuite = await prisma.suite.findFirst({
    where: { area: SuiteArea.NORTH_TERRACE, number: 5 },
  });

  if (!sellerSuite) {
    throw new Error('Could not find North Terrace Suite 5');
  }

  // Create approved seller application
  console.log('📝 Creating approved seller application...');
  await prisma.sellerApplication.create({
    data: {
      userId: seller.id,
      suiteId: sellerSuite.id,
      status: 'APPROVED',
      legalName: 'John Smith',
      message: 'I own North Terrace Suite 5 and would like to list my tickets.',
      adminNote: 'Verified suite ownership.',
      decidedAt: new Date(),
    },
  });

  console.log('✓ Application created and approved\n');

  // Create sample listings
  console.log('🎫 Creating sample listings...');

  // Active listing 1
  const listing1 = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      suiteId: sellerSuite.id,
      eventTitle: 'The Rolling Stones',
      eventDatetime: new Date('2025-06-15T19:30:00'),
      quantity: 4,
      pricePerSeat: 250.00,
      deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
      contactEmail: seller.email,
      contactPhone: seller.phone,
      allowMessages: true,
      notes: 'Great seats in North Terrace Suite 5! Perfect view of the stage.',
      status: ListingStatus.ACTIVE,
      seatNumbers: '1,2,3,4',
      slug: 'the-rolling-stones-2025-06-15-n5',
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing1.id,
      url: '/uploads/sample/suite-view.jpg',
      alt: 'View from North Terrace Suite 5',
      order: 0,
    },
  });

  // Active listing 2
  const listing2 = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      suiteId: sellerSuite.id,
      eventTitle: 'Ed Sheeran',
      eventDatetime: new Date('2025-07-20T20:00:00'),
      quantity: 8,
      pricePerSeat: 180.00,
      deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
      contactEmail: seller.email,
      allowMessages: true,
      notes: 'All 8 seats available in our fire suite. Includes suite amenities.',
      status: ListingStatus.ACTIVE,
      seatNumbers: '1,2,3,4,5,6,7,8',
      slug: 'ed-sheeran-2025-07-20-n5',
    },
  });

  // Draft listing
  await prisma.listing.create({
    data: {
      sellerId: seller.id,
      suiteId: sellerSuite.id,
      eventTitle: 'Coldplay',
      eventDatetime: new Date('2025-08-10T19:00:00'),
      quantity: 6,
      pricePerSeat: 220.00,
      deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
      contactEmail: seller.email,
      notes: 'Draft - still finalizing details',
      status: ListingStatus.DRAFT,
      slug: 'coldplay-2025-08-10-n5-draft',
    },
  });

  // Add more listings across different suites for map visualization
  const lowerSuite17 = await prisma.suite.findFirst({
    where: { area: SuiteArea.LOWER_FIRE, number: 17 },
  });

  const lowerSuite45 = await prisma.suite.findFirst({
    where: { area: SuiteArea.LOWER_FIRE, number: 45 },
  });

  const southSuite12 = await prisma.suite.findFirst({
    where: { area: SuiteArea.SOUTH_TERRACE, number: 12 },
  });

  if (lowerSuite17) {
    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        suiteId: lowerSuite17.id,
        eventTitle: 'Taylor Swift - Eras Tour',
        eventDatetime: new Date('2025-08-15T19:30:00'),
        quantity: 4,
        pricePerSeat: 350.00,
        deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
        contactEmail: 'owner17@example.com',
        contactPhone: '719-555-0117',
        allowMessages: true,
        notes: 'Lower Fire Suite 17 - Prime center location! Mobile transfer via Ticketmaster.',
        status: ListingStatus.ACTIVE,
        seatNumbers: '1,2,3,4',
        slug: 'taylor-swift-eras-tour-lower-17',
      },
    });
  }

  if (lowerSuite45) {
    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        suiteId: lowerSuite45.id,
        eventTitle: 'Metallica',
        eventDatetime: new Date('2025-09-05T20:00:00'),
        quantity: 6,
        pricePerSeat: 275.00,
        deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
        contactEmail: 'suite45@firesuites.com',
        contactPhone: '719-555-0145',
        allowMessages: true,
        notes: '6 seats available - perfect for a group! Includes parking pass.',
        status: ListingStatus.ACTIVE,
        seatNumbers: '3,4,5,6,7,8',
        slug: 'metallica-2025-09-05-lower-45',
      },
    });
  }

  if (southSuite12) {
    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        suiteId: southSuite12.id,
        eventTitle: 'Luke Combs',
        eventDatetime: new Date('2025-07-30T19:00:00'),
        quantity: 8,
        pricePerSeat: 200.00,
        deliveryMethod: DeliveryMethod.MOBILE_TRANSFER,
        contactLink: 'https://stubhub.com/example',
        contactEmail: 'south12@example.com',
        allowMessages: false,
        notes: 'South Terrace Suite 12 - All 8 seats. AXS transfer available.',
        status: ListingStatus.ACTIVE,
        slug: 'luke-combs-2025-07-30-south-12',
      },
    });
  }

  console.log('✓ Created 6 sample listings (including map demo listings)\n');

  // Create audit events
  console.log('📋 Creating audit events...');
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: admin.id,
        action: 'SELLER_APPLICATION_APPROVED',
        targetType: 'SellerApplication',
        targetId: seller.id,
        metadata: { suiteArea: 'NORTH_TERRACE', suiteNumber: 5 },
      },
      {
        actorId: seller.id,
        action: 'LISTING_CREATED',
        targetType: 'Listing',
        targetId: listing1.id,
        metadata: { eventTitle: 'The Rolling Stones' },
      },
      {
        actorId: seller.id,
        action: 'LISTING_CREATED',
        targetType: 'Listing',
        targetId: listing2.id,
        metadata: { eventTitle: 'Ed Sheeran' },
      },
    ],
  });

  console.log('✓ Created audit events\n');

  console.log('✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Suites: ${suites.length}`);
  console.log('   Users: 3 (1 admin, 1 seller, 1 guest)');
  console.log('   Listings: 6 (5 active across multiple suites, 1 draft)');
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin:  admin@firesuite.exchange / Admin123!');
  console.log('   Seller: seller@example.com / Seller123!');
  console.log('   Guest:  guest@example.com / Guest123!');
  console.log('\n🌐 MailHog UI: http://localhost:8025');
  console.log('📧 All emails will be captured by MailHog during development\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
