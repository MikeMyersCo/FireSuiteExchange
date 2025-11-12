import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAdminListings() {
  try {
    console.log('🗑️  Deleting listings for admin user...\n');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'mikemyersco@gmail.com' }
    });

    if (!user) {
      console.error('❌ User mikemyersco@gmail.com not found!');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Delete all listings for this user
    const deletedListings = await prisma.listing.deleteMany({
      where: {
        sellerId: user.id
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Listings deleted successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🗑️  Deleted: ${deletedListings.count} listings`);
    console.log(`👤 User: ${user.email}`);
    console.log(`✅ Approved seller application: PRESERVED`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 You can now run create-listings-for-admin.ts to create new listings with varied pricing\n');

  } catch (error) {
    console.error('❌ Error deleting listings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdminListings();
