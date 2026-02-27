import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Actually, let's keep it username based for now. We can allow email later.

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({ token, username });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

import { authenticate, AuthRequest } from '../middleware/auth';

router.get('/me', authenticate, async (req: AuthRequest, res) => {
    // authenticate middleware already fetches user and active household
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
        id: req.user.id,
        username: req.user.username,
        householdId: req.user.householdId,
        role: req.user.role
    });
});

export default router;
