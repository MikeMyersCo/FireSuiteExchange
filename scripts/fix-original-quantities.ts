import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOriginalQuantities() {
  console.log('Fixing originalQuantity values for existing listings...');

  // For listings that haven't been partially sold (where originalQuantity is still 8 default),
  // set originalQuantity to match the current quantity
  const result = await prisma.listing.updateMany({
    where: {
      originalQuantity: 8,
    },
    data: {
      originalQuantity: prisma.$queryRaw`quantity`,
    },
  });

  console.log(`Updated ${result.count} listings`);
}

// Alternative approach: Update each listing individually
async function fixOriginalQuantitiesIndividually() {
  console.log('Fixing originalQuantity values for existing listings...');

  const listings = await prisma.listing.findMany({
    where: {
      originalQuantity: 8,
    },
    select: {
      id: true,
      quantity: true,
      originalQuantity: true,
    },
  });

  console.log(`Found ${listings.length} listings to update`);

  for (const listing of listings) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { originalQuantity: listing.quantity },
    });
    console.log(`Updated listing ${listing.id}: originalQuantity set to ${listing.quantity}`);
  }

  console.log('Done!');
}

fixOriginalQuantitiesIndividually()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
