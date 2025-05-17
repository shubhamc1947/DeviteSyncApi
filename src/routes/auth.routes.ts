import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register (admin-only creates users)
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);


export default router;