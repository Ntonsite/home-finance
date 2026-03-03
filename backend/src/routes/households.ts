import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List household members
router.get('/members', async (req: AuthRequest, res) => {
    try {
        const members = await prisma.householdMember.findMany({
            where: { householdId: req.user?.householdId },
            include: {
                user: { select: { id: true, name: true, username: true, email: true } }
            }
        });

        res.json({ members });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch household members' });
    }
});

// Add member directly
router.post('/members', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { username, role } = req.body;
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        const userToAdd = await prisma.user.findUnique({
            where: { username }
        });

        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found. They must register first.' });
        }

        // Check if already in household
        const existingMember = await prisma.householdMember.findUnique({
            where: {
                householdId_userId: {
                    householdId: req.user!.householdId,
                    userId: userToAdd.id
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ error: 'User is already a member of this household' });
        }

        const newMember = await prisma.householdMember.create({
            data: {
                householdId: req.user!.householdId,
                userId: userToAdd.id,
                role
            },
            include: {
                user: { select: { id: true, name: true, username: true, email: true } }
            }
        });

        res.status(201).json({ message: 'Member added successfully', member: newMember });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Delete member
router.delete('/members/:id', requireRole(['OWNER']), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params; // HouseholdMember ID

        const member = await prisma.householdMember.findUnique({ where: { id: Number(id) } });
        if (!member) return res.status(404).json({ error: 'Member not found' });
        if (member.householdId !== req.user?.householdId) return res.status(403).json({ error: 'Forbidden' });
        if (member.userId === req.user?.id) return res.status(400).json({ error: 'Cannot remove yourself' });

        await prisma.householdMember.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

export default router;
