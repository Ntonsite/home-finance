import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import crypto from 'crypto';

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

        const invites = await prisma.invitation.findMany({
            where: { householdId: req.user?.householdId, accepted: false }
        });

        res.json({ members, invites });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch household members' });
    }
});

// Create invite
router.post('/invite', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const invite = await prisma.invitation.upsert({
            where: {
                householdId_email: {
                    householdId: req.user!.householdId,
                    email
                }
            },
            update: { token, expiresAt, role },
            create: {
                householdId: req.user!.householdId,
                email,
                role,
                token,
                expiresAt
            }
        });

        // In a real app we would send an email here. For now we just return the invite link
        const inviteUrl = `${req.protocol}://${req.get('host')}/accept-invite?token=${token}`;
        res.status(201).json({ invite, inviteUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invite' });
    }
});

// We need a public route for accepting the invite (since they might not have an account yet or they need to log in during the process)
// But since the frontend will handle auth first, the frontend will pass the token to a protected endpoint once the user is logged in.
router.post('/accept-invite', async (req: AuthRequest, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const invite = await prisma.invitation.findUnique({ where: { token } });

        if (!invite) return res.status(404).json({ error: 'Invite not found' });
        if (invite.accepted) return res.status(400).json({ error: 'Invite already accepted' });
        if (new Date() > invite.expiresAt) return res.status(400).json({ error: 'Invite expired' });

        // Add user to household
        await prisma.householdMember.create({
            data: {
                householdId: invite.householdId,
                userId: req.user!.id,
                role: invite.role
            }
        });

        // Mark invite as accepted
        await prisma.invitation.update({
            where: { id: invite.id },
            data: { accepted: true }
        });

        res.json({ message: 'Successfully joined household' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept invite' });
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

// Delete invite
router.delete('/invite/:id', requireRole(['OWNER', 'ADMIN']), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const invite = await prisma.invitation.findUnique({ where: { id: Number(id) } });
        if (!invite) return res.status(404).json({ error: 'Invite not found' });
        if (invite.householdId !== req.user?.householdId) return res.status(403).json({ error: 'Forbidden' });

        await prisma.invitation.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove invite' });
    }
});

export default router;
