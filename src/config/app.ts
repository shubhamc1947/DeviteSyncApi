import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    apiLimiter: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};