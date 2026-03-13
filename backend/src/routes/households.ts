import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Create a new household
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Household name is required' });

        const household = await prisma.household.create({
            data: {
                name,
                members: {
                    create: {
                        userId: req.user!.id,
                        role: 'OWNER'
                    }
                }
            }
        });

        res.status(201).json(household);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create household' });
    }
});

// List all households (SuperAdmin only)
router.get('/all', requireRole(['SUPERADMIN']), async (req: AuthRequest, res) => {
    try {
        const households = await prisma.household.findMany({
            include: {
                _count: { select: { members: true } }
            }
        });
        res.json(households);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all households' });
    }
});

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
        const targetHouseholdId = req.user!.householdId; // Or from body if SuperAdmin
        
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        const userToAdd = await prisma.user.findUnique({
            where: { username }
        });

        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found. They must register first.' });
        }

        const existingMember = await prisma.householdMember.findUnique({
            where: {
                householdId_userId: {
                    householdId: targetHouseholdId!,
                    userId: userToAdd.id
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ error: 'User is already a member of this household' });
        }

        const newMember = await prisma.householdMember.create({
            data: {
                householdId: targetHouseholdId!,
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
        const { id } = req.params;

        const member = await prisma.householdMember.findUnique({ where: { id: Number(id) } });
        if (!member) return res.status(404).json({ error: 'Member not found' });
        if (!req.user?.isSuperAdmin && member.householdId !== req.user?.householdId) return res.status(403).json({ error: 'Forbidden' });
        if (member.userId === req.user?.id) return res.status(400).json({ error: 'Cannot remove yourself' });

        await prisma.householdMember.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

// Accept invitation
router.post('/accept-invite', async (req: AuthRequest, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const invitation = await prisma.invitation.findUnique({
            where: { id: token },
            include: { household: true }
        });

        if (!invitation) return res.status(404).json({ error: 'Invalid invitation link' });
        if (invitation.usedAt) return res.status(400).json({ error: 'Invitation has already been used' });
        if (invitation.expiresAt < new Date()) return res.status(400).json({ error: 'Invitation has expired' });

        const existingMember = await prisma.householdMember.findUnique({
            where: {
                householdId_userId: {
                    householdId: invitation.householdId,
                    userId: req.user!.id
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ error: 'You are already a member of this household' });
        }

        const newMember = await prisma.householdMember.create({
            data: {
                householdId: invitation.householdId,
                userId: req.user!.id,
                role: invitation.role
            }
        });

        await prisma.invitation.update({
            where: { id: token },
            data: {
                usedAt: new Date(),
                usedById: req.user!.id
            }
        });

        res.json({ message: 'Successfully joined household', household: invitation.household, member: newMember });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
});

export default router;
