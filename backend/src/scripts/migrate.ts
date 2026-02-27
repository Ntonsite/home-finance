import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration script for multi-tenant architecture...');

    // 1. Create a Default Household if none exists
    let defaultHousehold = await prisma.household.findFirst();
    if (!defaultHousehold) {
        defaultHousehold = await prisma.household.create({
            data: {
                name: 'My Household',
            },
        });
        console.log(`Created default household: ${defaultHousehold.name} (${defaultHousehold.id})`);
    } else {
        console.log(`Found existing household: ${defaultHousehold.name} (${defaultHousehold.id})`);
    }

    // 2. Assign all existing users to the 'Default Household' as OWNERs
    // In a real app, this might just be the one 'admin' user
    const users = await prisma.user.findMany();
    for (const user of users) {
        // Check if membership already exists
        const existingMembership = await prisma.householdMember.findUnique({
            where: {
                householdId_userId: {
                    householdId: defaultHousehold.id,
                    userId: user.id,
                }
            }
        });

        if (!existingMembership) {
            await prisma.householdMember.create({
                data: {
                    householdId: defaultHousehold.id,
                    userId: user.id,
                    role: 'OWNER', // Make existing users owners of the default household
                },
            });
            console.log(`Assigned user '${user.username}' as OWNER of household '${defaultHousehold.name}'`);
        }

        // Default email if missing
        if (!user.email) {
            const defaultEmail = `${user.username}@example.com`;
            await prisma.user.update({
                where: { id: user.id },
                data: { email: defaultEmail }
            });
            console.log(`Assigned default email '${defaultEmail}' to user '${user.username}'`);
        }
    }

    // Find an admin user to assign as addedById
    const adminUser = users.length > 0 ? users[0] : null;

    // 3. Migrate existing Categories
    const categories = await prisma.category.findMany({ where: { householdId: { equals: '' } } }); // or check null if changing schema
    if (categories.length > 0) {
        for (const category of categories) {
            await prisma.category.update({
                where: { id: category.id },
                data: { householdId: defaultHousehold.id }
            });
        }
        console.log(`Migrated ${categories.length} categories to household '${defaultHousehold.name}'`);
    } else {
        // Because of how schema is setup now, some updates might be needed or assumed
        console.log('Categories likely already migrated or no orphans found');
    }

    // Note: For existing production SQL databases that have been running, doing a raw SQL update 
    // is sometimes easier `UPDATE "Category" SET "householdId" = 'uuid' WHERE "householdId" IS NULL;`

    console.log('Migration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
