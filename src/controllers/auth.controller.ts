// controllers/auth.controller.ts
import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json(result);
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;
        const result = await registerUser(username, email, password, role);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
