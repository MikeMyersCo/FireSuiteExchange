import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@firesuite.com' }
    });

    if (existingUser) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@firesuite.com');
      console.log('🔑 Password: Admin123!');
      console.log('👤 Role:', existingUser.role);
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email: 'admin@firesuite.com',
        name: 'Admin User',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isLocked: false,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@firesuite.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Name: Admin User');
    console.log('👑 Role: ADMIN');
    console.log('🆔 User ID:', user.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔐 You can now log in at http://localhost:3001/login');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
