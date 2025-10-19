import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const email = 'cossunsettickets@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        showInDirectory: true,
        sellerApplications: {
          include: {
            suite: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`❌ User ${email} not found`);
      return;
    }

    console.log('\n📧 User Details:');
    console.log(`  Name: ${user.name || 'Not set'}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Show in Directory: ${user.showInDirectory}`);
    console.log(`  Applications: ${user.sellerApplications.length}`);

    if (user.sellerApplications.length > 0) {
      console.log('\n📋 Seller Applications:');
      user.sellerApplications.forEach((app: any) => {
        console.log(`  - Suite ${app.suite.displayName}: ${app.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
