import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    take: 5,
    select: {
      id: true,
      eventTitle: true,
      contactEmail: true,
      contactPhone: true,
      contactMessenger: true,
    },
  });

  console.log('First 5 listings:');
  console.table(listings);

  const withMessenger = await prisma.listing.count({
    where: {
      contactMessenger: {
        not: null,
      },
    },
  });

  const total = await prisma.listing.count();

  console.log(`\nTotal listings: ${total}`);
  console.log(`Listings with Messenger: ${withMessenger}`);
  console.log(`Percentage: ${((withMessenger / total) * 100).toFixed(1)}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
