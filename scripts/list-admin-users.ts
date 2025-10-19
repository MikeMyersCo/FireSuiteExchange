import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdminUsers() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'APPROVER' },
          { role: 'SELLER' },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'desc' },
        { email: 'asc' },
      ],
    });

    console.log(`\nFound ${admins.length} users with elevated roles:\n`);

    admins.forEach((user) => {
      console.log(`${user.role.padEnd(10)} | ${user.email.padEnd(40)} | ${user.name || 'No name'}`);
    });

    console.log('\n⚠️ Note: Passwords are hashed and cannot be retrieved.');
    console.log('If you need to login, you may need to reset a password or check your seed data.\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdminUsers();
