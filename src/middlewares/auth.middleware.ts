import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/app';
import { AuthRequest } from '../types';
import { UnauthorizedError } from './error.middleware';

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }
        console.log("Auth Admin Token => ", token)

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as {
            id: string;
            username: string;
            role: 'admin' | 'user';
        };
        console.log(decoded);
        // Set user data on request

        if (decoded.role === 'user') {
            throw new UnauthorizedError('Not a admin user');
        }

        req.user = decoded;

        next();
    } catch (error) {
        // next(new UnauthorizedError('Invalid token'));
        next(error);
    }
};

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }
        console.log("Auth User Token => ", token)
        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as {
            id: string;
            username: string;
            role: 'admin' | 'user';
        };
        console.log(decoded);
        // Set user data on request

        if (decoded.role === 'admin') {
            throw new UnauthorizedError('Admin User not Authorize');
        }

        req.user = decoded;

        next();
    } catch (error) {
        // next(new UnauthorizedError('Invalid token'));
        next(error);
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return next(new UnauthorizedError('Not authorized to access this resource'));
        }

        next();
    };
};