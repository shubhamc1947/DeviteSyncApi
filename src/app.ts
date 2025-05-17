import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import config from './config/app';
import logger from './config/logger';
import deviceRoutes from './routes/device.routes';
import authRoute from './routes/auth.routes'
import syncRoutes from './routes/sync.routes';
import { errorHandler } from './middlewares/error.middleware';
import { ensureDatabaseExists } from './seed/dbCreation';

// Initialize the Express application
const app = express();

// Apply global middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all origins
app.use(compression()); // Compress responses
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// Apply rate limiting
app.use(rateLimit(config.apiLimiter));

// Define routes
app.use('/api/auth', authRoute);
app.use('/api/devices', deviceRoutes);
app.use('/api/sync', syncRoutes);

// Health check endpoint
app.get('/health', (_, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

// Global error handler
app.use(errorHandler);

// Handle 404 - Route not found
app.use((_, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Initialize database connection and start the server
async function bootstrap() {
    try {
        // Initialize database connection
        await ensureDatabaseExists();

        await AppDataSource.initialize();
        logger.info('Database connection initialized');

        // Start the server
        const port = config.port;
        app.listen(port, () => {
            logger.info(`PiSync backend server running on port ${port}`);
            logger.info(`Environment: ${config.env}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the application
bootstrap();

export default app;