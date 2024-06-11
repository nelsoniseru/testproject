import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      package_name: 'Membership',
      package_plans: [
        { plan_type: 'Annual_Basic', plan_price: 800 },
        { plan_type: 'Annual_Premium', plan_price: 1000 },
        { plan_type: 'Monthly_Basic', plan_price: 650 },
        { plan_type: 'Monthly_Premuim', plan_price: 600 },
      ],
    },
    {
      package_name: 'Personal training',
      package_plans: [
        { plan_type: 'Annual_Basic', plan_price: 700 },
        { plan_type: 'Annual_Premium', plan_price: 9000 },
        { plan_type: 'Monthly_Basic', plan_price: 450 },
        { plan_type: 'Monthly_Premuim', plan_price: 600 },
      ],
    },
    {
      package_name: 'Wellness and recovery',
      package_plans: [
        { plan_type: 'Annual_Basic', plan_price: 700 },
        { plan_type: 'Annual_Premium', plan_price: 800 },
        { plan_type: 'Monthly_Basic', plan_price: 350 },
        { plan_type: 'Monthly_Premuim', plan_price: 600 },
      ],
    },
    {
      package_name: 'Group fitness',
      package_plans: [
        { plan_type: 'Annual_Basic', plan_price: 800 },
        { plan_type: 'Annual_Premium', plan_price: 1000 },
        { plan_type: 'Monthly_Basic', plan_price: 750 },
        { plan_type: 'Monthly_Premuim', plan_price: 800 },
      ],
    },
  ];

  for (const pkg of packages) {
    await prisma.package.create({
      data: {
        package_name: pkg.package_name,
        package_plans: pkg.package_plans,
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
