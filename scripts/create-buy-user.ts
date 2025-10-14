import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'buytickets@example.com' }
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('📧 Email: buytickets@example.com');
      console.log('🔑 Password: pa$$word');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('pa$$word', 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'buytickets@example.com',
        name: 'Buy Tickets',
        passwordHash: passwordHash,
        role: 'GUEST',
        isLocked: false,
      },
    });

    console.log('✅ User created successfully!');
    console.log('📧 Email: buytickets@example.com');
    console.log('🔑 Password: pa$$word');
    console.log('👤 Name: Buy Tickets');
    console.log('🆔 User ID:', user.id);
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
