"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate);
// Generate invitation link
router.post('/', (0, auth_1.requireRole)(['OWNER', 'ADMIN']), async (req, res) => {
    try {
        const { role, email, expiresInDays } = req.body;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));
        const invitation = await prisma.invitation.create({
            data: {
                householdId: req.user.householdId,
                role: role || 'MEMBER',
                email: email || null,
                expiresAt
            }
        });
        res.status(201).json(invitation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate invitation' });
    }
});
// Get active invitations for household
router.get('/', (0, auth_1.requireRole)(['OWNER', 'ADMIN']), async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch invitations' });
    }
});
// Revoke invitation
router.delete('/:id', (0, auth_1.requireRole)(['OWNER', 'ADMIN']), async (req, res) => {
    try {
        const id = req.params.id;
        const invitation = await prisma.invitation.findUnique({ where: { id } });
        if (!invitation || invitation.householdId !== req.user?.householdId) {
            return res.status(404).json({ error: 'Invitation not found' });
        }
        await prisma.invitation.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to revoke invitation' });
    }
});
exports.default = router;
