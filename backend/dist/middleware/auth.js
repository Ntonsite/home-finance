"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_keep_safe';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // We get the user ID from the token. Now, find their most recent or primary household.
        // In a multi-tenant SaaS, the user might select the active household, but for MVP we auto-select the first one.
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                memberships: {
                    include: { household: true },
                    take: 1 // Fetch primary household for now
                }
            }
        });
        if (!user || user.memberships.length === 0) {
            res.status(403).json({ error: 'Forbidden: User does not belong to any household' });
            return;
        }
        const membership = user.memberships[0];
        req.user = {
            id: user.id,
            username: user.username,
            householdId: membership.householdId,
            role: membership.role
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};
exports.authenticate = authenticate;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
