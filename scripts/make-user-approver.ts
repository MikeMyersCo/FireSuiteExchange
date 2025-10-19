import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserApprover() {
  try {
    const email = 'james.smith0@example.com';

    // Update user to APPROVER role
    const user = await prisma.user.update({
      where: { email },
      data: {
        role: 'APPROVER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`\n✅ Successfully updated user to APPROVER:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);
    console.log('This user can now:');
    console.log('  - Access the Owners Lounge');
    console.log('  - Review and approve seller applications at /approver/applications');
    console.log('  - See "Review Applications" link in navigation\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserApprover();
