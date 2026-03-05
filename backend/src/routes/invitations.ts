import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Generate invitation link
router.post('/', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { role, email, expiresInDays } = req.body;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));

        const invitation = await prisma.invitation.create({
            data: {
                householdId: req.user!.householdId,
                role: role || 'MEMBER',
                email: email || null,
                expiresAt
            }
        });

        res.status(201).json(invitation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate invitation' });
    }
});

// Get active invitations for household
router.get('/', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const invitations = await prisma.invitation.findMany({
            where: {
                householdId: req.user?.householdId,
                usedAt: null,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invitations' });
    }
});

// Revoke invitation
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const id = req.params.id as string;
        const invitation = await prisma.invitation.findUnique({ where: { id } });

        if (!invitation || invitation.householdId !== req.user?.householdId) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        await prisma.invitation.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke invitation' });
    }
});

export default router;
