import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        householdId?: string;
        role?: string;
        isSuperAdmin: boolean;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_keep_safe';
        const decoded = jwt.verify(token, secret) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                memberships: {
                    include: { household: true },
                    take: 1
                }
            }
        });

        if (!user) {
            res.status(401).json({ error: 'Unauthorized: User not found' });
            return;
        }

        const membership = user.memberships[0];

        req.user = {
            id: user.id,
            username: user.username,
            householdId: membership?.householdId,
            role: membership?.role,
            isSuperAdmin: user.isSuperAdmin
        };

        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
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
