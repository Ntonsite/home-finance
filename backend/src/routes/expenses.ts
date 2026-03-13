import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all expenses (household + personal)
router.get('/', async (req: AuthRequest, res) => {
    try {
        const { personal } = req.query;
        
        const where: any = {};
        
        if (personal === 'true') {
            where.isPersonal = true;
            where.addedById = req.user!.id;
        } else if (req.user?.householdId) {
            where.householdId = req.user.householdId;
            where.isPersonal = false;
        } else {
            // User has no household, only personal expenses
            where.isPersonal = true;
            where.addedById = req.user!.id;
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                subcategory: {
                    include: { category: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Create an expense
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { date, subcategoryId, quantity, unit, amount, paymentMethod, notes, isPersonal } = req.body;

        const expense = await prisma.expense.create({
            data: {
                householdId: isPersonal ? null : req.user!.householdId,
                addedById: req.user!.id,
                date: new Date(date),
                subcategoryId: Number(subcategoryId),
                quantity: Number(quantity),
                unit,
                amount: Number(amount),
                paymentMethod,
                notes,
                isPersonal: !!isPersonal
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Update an expense
router.put('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { date, subcategoryId, quantity, unit, amount, paymentMethod, notes, isPersonal } = req.body;

        const expense = await prisma.expense.update({
            where: { id: Number(id) },
            data: {
                date: new Date(date),
                subcategoryId: Number(subcategoryId),
                quantity: Number(quantity),
                unit,
                amount: Number(amount),
                paymentMethod,
                notes,
                isPersonal: !!isPersonal,
                householdId: isPersonal ? null : req.user!.householdId,
            }
        });

        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete an expense
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

export default router;
