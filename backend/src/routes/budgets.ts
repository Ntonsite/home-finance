import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get budgets for a specific month and year
router.get('/', async (req: AuthRequest, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const budgets = await prisma.budget.findMany({
            where: {
                householdId: req.user?.householdId,
                month: Number(month),
                year: Number(year),
            },
            include: {
                category: true,
            }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// Set or update budget
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { month, year, categoryId, amount } = req.body;

        // Verify category belongs to household
        const category = await prisma.category.findFirst({
            where: { id: Number(categoryId), householdId: req.user?.householdId }
        });
        if (!category) return res.status(403).json({ error: 'Access denied' });

        // Prisma upsert does not support secondary unique constraints with dynamic filters well depending on the version.
        // Easiest is to manually find and update or create
        let budget = await prisma.budget.findFirst({
            where: { month: Number(month), year: Number(year), categoryId: Number(categoryId), householdId: req.user?.householdId }
        });

        if (budget) {
            budget = await prisma.budget.update({
                where: { id: budget.id },
                data: { amount: Number(amount) }
            });
        } else {
            budget = await prisma.budget.create({
                data: {
                    householdId: req.user!.householdId,
                    month: Number(month),
                    year: Number(year),
                    categoryId: Number(categoryId),
                    amount: Number(amount)
                }
            });
        }
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: 'Failed to set budget' });
    }
});

export default router;
