"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
// Get all categories with their subcategories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { householdId: req.user?.householdId },
            include: { subcategories: true },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// Create category
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: { name, householdId: req.user.householdId },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});
// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await prisma.category.updateMany({
            where: { id: Number(id), householdId: req.user?.householdId },
            data: { name },
        });
        res.json({ message: 'Category updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});
// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.deleteMany({
            where: { id: Number(id), householdId: req.user?.householdId },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});
exports.default = router;
