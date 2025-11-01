import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { EVENTS_2026 } from '../src/lib/events-2026';

const prisma = new PrismaClient();

// Sample names for fake users
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'David', 'Barbara', 'William', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

// Generate random phone number
function generatePhone(): string {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

// Generate random price between $100 and $300
function generatePrice(): number {
  return Math.floor(Math.random() * 201) + 100; // $100 to $300
}

// Generate quantity - always 8 seats (full suite capacity)
function generateQuantity(): number {
  return 8; // Always 8 seats for full suite
}

// Get delivery method - always AXS Transfer
function getDeliveryMethod(): string {
  return 'MOBILE_TRANSFER'; // AXS Transfer
}

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing listings and applications (but keep your real users)
  console.log('🗑️  Clearing existing listings and applications...');
  await prisma.listing.deleteMany({});
  await prisma.sellerApplication.deleteMany({
    where: {
      user: {
        email: {
          contains: '@example.com'
        }
      }
    }
  });

  // Delete fake users (ones with @example.com emails)
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@example.com'
      }
    }
  });

  console.log('✅ Cleared fake data\n');

  // Create suites if they don't exist
  console.log('🏢 Ensuring all suites exist...');
  const suitesToCreate = [];

  // Lower Fire Suites (L1-L90)
  for (let i = 1; i <= 90; i++) {
    suitesToCreate.push({
      area: 'L' as any,
      number: i,
      displayName: `L${i}`,
      capacity: 8,
    });
  }

  // Upper North Terrace (UNT1-UNT20)
  for (let i = 1; i <= 20; i++) {
    suitesToCreate.push({
      area: 'UNT' as any,
      number: i,
      displayName: `UNT${i}`,
      capacity: 8,
    });
  }

  // Upper South Terrace (UST1-UST20)
  for (let i = 1; i <= 20; i++) {
    suitesToCreate.push({
      area: 'UST' as any,
      number: i,
      displayName: `UST${i}`,
      capacity: 8,
    });
  }

  // Create suites with upsert to avoid duplicates
  for (const suite of suitesToCreate) {
    await prisma.suite.upsert({
      where: {
        area_number: {
          area: suite.area,
          number: suite.number,
        },
      },
      update: {},
      create: suite,
    });
  }

  console.log(`✅ ${suitesToCreate.length} suites verified\n`);

  // Get all suites sorted
  const allSuites = await prisma.suite.findMany({
    orderBy: [{ area: 'asc' }, { number: 'asc' }],
  });

  // Create 60 fake users with verified suites distributed across all areas
  console.log('👥 Creating 60 fake users with suite ownership...\n');
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Get suites by area
  const lowerSuites = allSuites.filter(s => s.area === 'L');
  const northSuites = allSuites.filter(s => s.area === 'UNT');
  const southSuites = allSuites.filter(s => s.area === 'UST');

  // Create 30 Lower Bowl owners
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const phone = generatePhone();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'SELLER',
        name: `${firstName} ${lastName}`,
        phone,
        emailVerified: new Date(),
      },
    });

    users.push(user);

    const suite = lowerSuites[i % lowerSuites.length];

    await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        suiteId: suite.id,
        status: 'APPROVED',
        legalName: user.name!,
        message: 'I am a season ticket holder for this suite.',
        verifiedAt: new Date(),
        decidedAt: new Date(),
      },
    });

    console.log(`  ✓ ${i + 1}/60: ${user.name} owns Suite ${suite.displayName}`);
  }

  // Create 15 North Terrace owners
  for (let i = 0; i < 15; i++) {
    const idx = 30 + i;
    const firstName = firstNames[idx % firstNames.length];
    const lastName = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@example.com`;
    const phone = generatePhone();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'SELLER',
        name: `${firstName} ${lastName}`,
        phone,
        emailVerified: new Date(),
      },
    });

    users.push(user);

    const suite = northSuites[i % northSuites.length];

    await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        suiteId: suite.id,
        status: 'APPROVED',
        legalName: user.name!,
        message: 'I am a season ticket holder for this suite.',
        verifiedAt: new Date(),
        decidedAt: new Date(),
      },
    });

    console.log(`  ✓ ${idx + 1}/60: ${user.name} owns Suite ${suite.displayName}`);
  }

  // Create 15 South Terrace owners
  for (let i = 0; i < 15; i++) {
    const idx = 45 + i;
    const firstName = firstNames[idx % firstNames.length];
    const lastName = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@example.com`;
    const phone = generatePhone();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: 'SELLER',
        name: `${firstName} ${lastName}`,
        phone,
        emailVerified: new Date(),
      },
    });

    users.push(user);

    const suite = southSuites[i % southSuites.length];

    await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        suiteId: suite.id,
        status: 'APPROVED',
        legalName: user.name!,
        message: 'I am a season ticket holder for this suite.',
        verifiedAt: new Date(),
        decidedAt: new Date(),
      },
    });

    console.log(`  ✓ ${idx + 1}/60: ${user.name} owns Suite ${suite.displayName}`);
  }

  console.log('\n✅ Users and suite applications created\n');

  // Create listings for each concert
  console.log('🎫 Creating listings for all 2026 concerts...\n');
  let listingCount = 0;

  for (const event of EVENTS_2026) {
    // Create 3-6 listings per concert from different users
    const listingsPerEvent = Math.floor(Math.random() * 4) + 3; // 3-6 listings

    for (let i = 0; i < listingsPerEvent && i < users.length; i++) {
      const user = users[(listingCount + i) % users.length];

      // Get the user's verified suite
      const application = await prisma.sellerApplication.findFirst({
        where: {
          userId: user.id,
          status: 'APPROVED',
        },
        include: {
          suite: true,
        },
      });

      if (!application) continue;

      const quantity = generateQuantity();
      const pricePerSeat = generatePrice();
      const deliveryMethod = getDeliveryMethod();

      // Generate slug
      const slug = `${event.artist
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-${application.suite.displayName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Random notes (60% chance)
      const noteOptions = [
        'Great seats with excellent view of the stage!',
        'Suite includes parking pass and complimentary food/beverage.',
        'Perfect for groups - bring your friends!',
        'Climate-controlled suite with premium amenities.',
        'Best suite in the venue - you won\'t be disappointed!',
        'Incredible view and comfortable seating. You\'ll love it!',
        'Suite comes with VIP parking and private entrance.',
        'All-inclusive experience with premium bar service.',
        'Perfect for corporate events or special occasions.',
        'First-class seating with outstanding sightlines.',
      ];

      const notes = Math.random() > 0.4
        ? noteOptions[Math.floor(Math.random() * noteOptions.length)]
        : null;

      // Generate Facebook Messenger username from user's name
      const messengerUsername = user.name!
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');

      await prisma.listing.create({
        data: {
          sellerId: user.id,
          suiteId: application.suiteId,
          eventTitle: event.artist,
          eventDatetime: new Date(event.date),
          quantity,
          pricePerSeat,
          deliveryMethod: deliveryMethod as any,
          contactEmail: user.email,
          contactPhone: Math.random() > 0.2 ? user.phone : null, // 80% include phone
          contactMessenger: messengerUsername, // 100% include messenger
          allowMessages: Math.random() > 0.4, // 60% allow messages
          notes,
          status: 'ACTIVE',
          slug,
          seatNumbers: `1-${quantity}`,
        },
      });

      listingCount++;
    }

    console.log(`  ✓ ${event.artist}: ${listingsPerEvent} listings created`);
  }

  console.log(`\n✅ Created ${listingCount} total listings across ${EVENTS_2026.length} concerts!\n`);

  console.log('📊 Summary:');
  console.log(`   • ${allSuites.length} Fire Suites`);
  console.log(`   • 60 verified suite owners (30 Lower Bowl, 15 North Terrace, 15 South Terrace)`);
  console.log(`   • ${listingCount} active listings`);
  console.log(`   • ${EVENTS_2026.length} different concerts`);
  console.log(`   • Prices range from $100-$300 per seat`);
  console.log(`   • All listings include full suite capacity (8 seats)\n`);

  console.log('🎉 Seed completed successfully!\n');
  console.log('📝 Test Login Credentials:');
  console.log('   Email: james.smith0@example.com (or any firstname.lastname#@example.com)');
  console.log('   Password: password123\n');
  console.log('💡 All fake users are verified sellers with their own suites!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
