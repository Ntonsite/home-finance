"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Actually, let's keep it username based for now. We can allow email later.
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.json({ token, username });
    }
    catch (error) {
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(201).json({ token, username });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
const auth_1 = require("../middleware/auth");
router.get('/me', auth_1.authenticate, async (req, res) => {
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
exports.default = router;
