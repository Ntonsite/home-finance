import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('Admin user created');

  // Create or get default Household
  let household = await prisma.household.findFirst();
  if (!household) {
    household = await prisma.household.create({
      data: {
        name: 'MATO',
        members: {
          create: {
            userId: admin.id,
            role: 'OWNER',
          }
        }
      }
    });
    console.log('MATO Household created');
  }

  // Create test member user 'maisho'
  const maishoPassword = await bcrypt.hash('elvin2024', 10);
  const maisho = await prisma.user.upsert({
    where: { username: 'maisho' },
    update: {},
    create: {
      username: 'maisho',
      password: maishoPassword,
      name: 'Maisho',
    },
  });

  // Ensure maisho is in the household
  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: maisho.id,
      },
    },
    update: {},
    create: {
      householdId: household.id,
      userId: maisho.id,
      role: 'MEMBER',
    },
  });
  console.log('Test user maisho created and added to household');


  // Pre-seed Categories and Subcategories
  const categoriesData = [
    {
      name: 'Food',
      subcategories: [
        { name: 'Mchele', defaultUnit: 'kg' },
        { name: 'Nyama', defaultUnit: 'kg' },
        { name: 'Mafuta', defaultUnit: 'liters' },
        { name: 'Mboga', defaultUnit: 'units' },
      ],
    },
    {
      name: 'Utilities',
      subcategories: [
        { name: 'Electricity', defaultUnit: 'units' },
        { name: 'Water', defaultUnit: 'units' },
      ],
    },
    {
      name: 'Baby Needs',
      subcategories: [
        { name: 'Diapers', defaultUnit: 'pieces' },
        { name: 'Milk', defaultUnit: 'tins' },
      ],
    },
    {
      name: 'Fuel',
      subcategories: [
        { name: 'Petrol', defaultUnit: 'liters' },
        { name: 'Diesel', defaultUnit: 'liters' },
      ],
    },
    {
      name: 'Misc',
      subcategories: [],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name_householdId: { name: catData.name, householdId: household.id } },
      update: {},
      create: {
        name: catData.name,
        householdId: household.id,
      },
    });

    for (const sub of catData.subcategories) {
      await prisma.subcategory.upsert({
        where: { name_categoryId: { name: sub.name, categoryId: category.id } },
        update: {},
        create: {
          name: sub.name,
          categoryId: category.id,
          defaultUnit: sub.defaultUnit,
        },
      });
    }
  }

  console.log('Categories and subcategories seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
