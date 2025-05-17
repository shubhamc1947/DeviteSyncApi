// services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import config from '../config/app';

export const loginUser = async (email: string, password: string) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '1d' }
    );

    return { token };
};

export const registerUser = async (
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'user'
) => {
    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOneBy({ email });
    if (existing) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({ username, email, password: hashedPassword, role });

    await userRepo.save(newUser);
    return { message: 'User created' };
};
