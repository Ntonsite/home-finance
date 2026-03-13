import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Monthly Overview
router.get('/monthly-overview', async (req: AuthRequest, res) => {
    try {
        const { month, year, personal } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

        const m = Number(month);
        const y = Number(year);
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0);

        const where: any = {
            date: { gte: startDate, lte: endDate }
        };

        if (personal === 'true') {
            where.isPersonal = true;
            where.addedById = req.user!.id;
        } else if (req.user?.householdId) {
            where.householdId = req.user.householdId;
            where.isPersonal = false;
        } else {
            where.isPersonal = true;
            where.addedById = req.user!.id;
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                subcategory: {
                    include: { category: true }
                },
                addedBy: {
                    select: { username: true }
                }
            }
        });

        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const categorySpend: Record<string, number> = {};
        expenses.forEach(exp => {
            const catName = exp.subcategory.category.name;
            categorySpend[catName] = (categorySpend[catName] || 0) + exp.amount;
        });

        const dailyTrend: Record<string, number> = {};
        expenses.forEach(exp => {
            const day = exp.date.toISOString().split('T')[0];
            dailyTrend[day] = (dailyTrend[day] || 0) + exp.amount;
        });

        const subcategorySpend: Record<string, number> = {};
        const subcategoryQuantity: Record<string, number> = {};
        const subcategoryFrequency: Record<string, number> = {};

        expenses.forEach(exp => {
            const subName = exp.subcategory.name;
            subcategorySpend[subName] = (subcategorySpend[subName] || 0) + exp.amount;
            subcategoryQuantity[subName] = (subcategoryQuantity[subName] || 0) + exp.quantity;
            subcategoryFrequency[subName] = (subcategoryFrequency[subName] || 0) + 1;
        });

        const userSpend: Record<string, number> = {};
        expenses.forEach(exp => {
            const userName = exp.addedBy?.username || 'Unknown';
            userSpend[userName] = (userSpend[userName] || 0) + exp.amount;
        });

        const topSubcategories = Object.entries(subcategorySpend)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        res.json({
            totalSpent,
            categorySpend: Object.entries(categorySpend).map(([name, value]) => ({ name, value })),
            dailyTrend: Object.entries(dailyTrend).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)),
            subcategoryInsights: Object.keys(subcategorySpend).map(name => ({
                name,
                spent: subcategorySpend[name],
                quantity: subcategoryQuantity[name],
                frequency: subcategoryFrequency[name],
                avgCostPerUnit: subcategorySpend[name] / (subcategoryQuantity[name] || 1)
            })),
            userSpend: Object.entries(userSpend).map(([name, amount]) => ({ name, amount })),
            topSubcategories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch monthly overview' });
    }
});

// Comparison with previous month
router.get('/comparison', async (req: AuthRequest, res) => {
    try {
        const { month, year, personal } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

        const m = Number(month);
        const y = Number(year);

        const currentStart = new Date(y, m - 1, 1);
        const currentEnd = new Date(y, m, 0);

        const prevM = m === 1 ? 12 : m - 1;
        const prevY = m === 1 ? y - 1 : y;
        const prevStart = new Date(prevY, prevM - 1, 1);
        const prevEnd = new Date(prevY, prevM, 0);

        const currentWhere: any = { date: { gte: currentStart, lte: currentEnd } };
        const prevWhere: any = { date: { gte: prevStart, lte: prevEnd } };

        if (personal === 'true') {
            currentWhere.isPersonal = true;
            currentWhere.addedById = req.user!.id;
            prevWhere.isPersonal = true;
            prevWhere.addedById = req.user!.id;
        } else if (req.user?.householdId) {
            currentWhere.householdId = req.user.householdId;
            currentWhere.isPersonal = false;
            prevWhere.householdId = req.user.householdId;
            prevWhere.isPersonal = false;
        } else {
            currentWhere.isPersonal = true;
            currentWhere.addedById = req.user!.id;
            prevWhere.isPersonal = true;
            prevWhere.addedById = req.user!.id;
        }

        const currentExpenses = await prisma.expense.findMany({ where: currentWhere });
        const prevExpenses = await prisma.expense.findMany({ where: prevWhere });

        const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const prevTotal = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        let percentChange = 0;
        if (prevTotal > 0) {
            percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
        }

        res.json({
            currentTotal,
            prevTotal,
            percentChange,
            trend: percentChange > 0 ? 'increase' : 'decrease'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comparison' });
    }
});

export default router;
