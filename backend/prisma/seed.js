"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Create admin user
    const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
        },
    });
    console.log('Admin user created');
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
            where: { name: catData.name },
            update: {},
            create: { name: catData.name },
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
