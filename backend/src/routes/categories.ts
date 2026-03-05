import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all categories with their subcategories
router.get('/', async (req: AuthRequest, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { householdId: req.user?.householdId },
            include: { subcategories: true },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create category
router.post('/', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: { name, householdId: req.user!.householdId },
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
router.put('/:id', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await prisma.category.updateMany({
            where: { id: Number(id), householdId: req.user?.householdId },
            data: { name },
        });
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        await prisma.category.deleteMany({
            where: { id: Number(id), householdId: req.user?.householdId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

export default router;
