import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    // Get password from environment variable
    const newPassword = process.env.ADMIN_PASSWORD;
    if (!newPassword) {
      console.error('❌ Error: ADMIN_PASSWORD environment variable not set');
      console.log('Usage: ADMIN_PASSWORD="YourNewPassword" npx tsx scripts/reset-admin-password.ts');
      process.exit(1);
    }

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mikemyersco@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...\n');

      // Create admin user if doesn't exist
      const passwordHash = await bcrypt.hash(newPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'mikemyersco@gmail.com',
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
      console.log('📧 Email: mikemyersco@gmail.com');
      console.log('🔑 Password: [Set from ADMIN_PASSWORD env var]');
      console.log('👑 Role: ADMIN');
      console.log('🆔 User ID:', newUser.id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update the password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        passwordHash: newPasswordHash,
        isLocked: false // Ensure account is not locked
      }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: mikemyersco@gmail.com');
    console.log('🔑 New Password: [Set from ADMIN_PASSWORD env var]');
    console.log('👑 Role:', adminUser.role);
    console.log('🆔 User ID:', adminUser.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔓 Account unlocked and ready to use!');
    console.log('');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
