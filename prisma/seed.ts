import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Adventure",      slug: "adventure" },
    { name: "Food & Drink",   slug: "food-drink" },
    { name: "Arts & Culture", slug: "arts-culture" },
    { name: "Wellness",       slug: "wellness" },
    { name: "Professional",   slug: "professional" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`✅ Upserted category: ${cat.name}`);
  }
}

main()
  .then(() => {
    console.log("Seed complete");
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });