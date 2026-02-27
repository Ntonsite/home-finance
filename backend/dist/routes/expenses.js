"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { householdId: req.user?.householdId },
            include: {
                subcategory: {
                    include: { category: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});
// Create an expense
router.post('/', async (req, res) => {
    try {
        const { date, subcategoryId, quantity, unit, amount, paymentMethod, notes } = req.body;
        // Convert to numbers and exact Date
        const expense = await prisma.expense.create({
            data: {
                householdId: req.user.householdId,
                addedById: req.user.id,
                date: new Date(date),
                subcategoryId: Number(subcategoryId),
                quantity: Number(quantity),
                unit,
                amount: Number(amount),
                paymentMethod,
                notes
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});
// Update an expense
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, subcategoryId, quantity, unit, amount, paymentMethod, notes } = req.body;
        const expense = await prisma.expense.updateMany({
            where: { id: Number(id), householdId: req.user?.householdId },
            data: {
                date: new Date(date),
                subcategoryId: Number(subcategoryId),
                quantity: Number(quantity),
                unit,
                amount: Number(amount),
                paymentMethod,
                notes
            }
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});
// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.deleteMany({
            where: { id: Number(id), householdId: req.user?.householdId }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});
exports.default = router;
