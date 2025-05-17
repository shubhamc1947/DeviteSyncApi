import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { ErrorResponse } from '../types';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errorResponse: ErrorResponse = {
        status: 500,
        message: err.message || 'Internal Server Error'
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Log error
    logger.error(`${req.method} ${req.path} - ${err.message}`, {
        error: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        user: (req as any).user?.id
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.status = 400;
    } else if (err.name === 'UnauthorizedError') {
        errorResponse.status = 401;
    } else if (err.name === 'ForbiddenError') {
        errorResponse.status = 403;
    } else if (err.name === 'NotFoundError') {
        errorResponse.status = 404;
    }

    res.status(errorResponse.status).json(errorResponse);
};

export class NotFoundError extends Error {
    name = 'NotFoundError';
    constructor(message: string) {
        super(message);
    }
}

export class ValidationError extends Error {
    name = 'ValidationError';
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedError extends Error {
    name = 'UnauthorizedError';
    constructor(message: string) {
        super(message);
    }
}

export class ForbiddenError extends Error {
    name = 'ForbiddenError';
    constructor(message: string) {
        super(message);
    }
}