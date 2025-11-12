import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanupForTesting() {
  try {
    console.log('🧹 Starting database cleanup for user testing...\n');

    // Step 1: Delete all listings
    const deletedListings = await prisma.listing.deleteMany({});
    console.log(`✅ Deleted ${deletedListings.count} listings`);

    // Step 2: Delete all seller applications
    const deletedApplications = await prisma.sellerApplication.deleteMany({});
    console.log(`✅ Deleted ${deletedApplications.count} seller applications`);

    // Step 3: Delete all bug reports
    const deletedBugReports = await prisma.bugReport.deleteMany({});
    console.log(`✅ Deleted ${deletedBugReports.count} bug reports`);

    // Step 4: Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Cleanup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 5: Create a single admin user
    console.log('👤 Creating admin user for testing...\n');

    const passwordHash = await bcrypt.hash('Admin123!', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@firesuite.com',
        name: 'Admin User',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isLocked: false,
        emailVerified: new Date(),
      },
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@firesuite.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: ADMIN');
    console.log('🆔 User ID:', adminUser.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 6: Show what's left in the database
    const remainingSuites = await prisma.suite.count();
    const remainingListings = await prisma.listing.count();
    const remainingUsers = await prisma.user.count();

    console.log('📊 Database Summary:');
    console.log(`   - Suites: ${remainingSuites} (preserved)`);
    console.log(`   - Listings: ${remainingListings}`);
    console.log(`   - Users: ${remainingUsers}`);
    console.log('');
    console.log('🎯 Ready for user testing!');
    console.log('');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupForTesting();
