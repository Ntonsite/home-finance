"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
// Create subcategory
router.post('/', async (req, res) => {
    try {
        const { name, categoryId, defaultUnit } = req.body;
        // Verify that the category belongs to the user's household
        const category = await prisma.category.findFirst({
            where: { id: Number(categoryId), householdId: req.user?.householdId }
        });
        if (!category)
            return res.status(403).json({ error: 'Access denied' });
        const subcategory = await prisma.subcategory.create({
            data: { name, categoryId: Number(categoryId), defaultUnit },
        });
        res.status(201).json(subcategory);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create subcategory' });
    }
});
// Update subcategory
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId, defaultUnit } = req.body;
        // First verify ownership of the subcategory through its category
        const existing = await prisma.subcategory.findFirst({
            where: { id: Number(id), category: { householdId: req.user?.householdId } }
        });
        if (!existing)
            return res.status(403).json({ error: 'Access denied' });
        const subcategory = await prisma.subcategory.update({
            where: { id: Number(id) },
            data: { name, categoryId: Number(categoryId), defaultUnit },
        });
        res.json(subcategory);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update subcategory' });
    }
});
// Delete subcategory
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subcategory.deleteMany({
            where: { id: Number(id), category: { householdId: req.user?.householdId } },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete subcategory' });
    }
});
exports.default = router;
