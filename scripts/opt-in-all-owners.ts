import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function optInAllOwners() {
  try {
    console.log('Starting to opt-in all verified owners to the directory...');

    // Get all users who have approved seller applications
    const approvedApps = await prisma.sellerApplication.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const userIds = approvedApps.map(app => app.userId);

    console.log(`Found ${userIds.length} verified owners`);

    // Update all verified owners to show in directory
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        showInDirectory: true,
      },
    });

    console.log(`✅ Successfully opted-in ${result.count} owners to the directory`);

    // Show the updated users
    const updatedUsers = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        showInDirectory: true,
        role: true,
      },
    });

    console.log('\nUpdated users:');
    updatedUsers.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email}) - ${user.role} - Directory: ${user.showInDirectory}`);
    });

  } catch (error) {
    console.error('Error opting in owners:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

optInAllOwners();
