import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminEmail() {
  try {
    console.log('📧 Updating admin email address...\n');

    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('❌ No admin user found!');
      return;
    }

    // Update the email
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: 'mikemyersco@gmail.com' }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin email updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: mikemyersco@gmail.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: ADMIN');
    console.log('🆔 User ID:', updatedUser.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error updating admin email:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();
