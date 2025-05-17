// controllers/sync.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';
import { ValidationError } from '../middlewares/error.middleware';

// sync.controller.ts

export class SyncController {
    private syncService = new SyncService();

    userTriggerSync = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deviceId } = req.params;
            const { force, syncType } = req.body;
            const userId = (req as any).user?.id;
            const role = (req as any).user?.role;

            if (!deviceId || !userId) {
                throw new ValidationError('Device ID and User ID are required');
            }

            if (role === 'admin') {
                throw new ValidationError('Admins are not allowed to trigger syncs');
            }

            const result = await this.syncService.triggerSync({
                deviceId,
                userId,
                force: force === true,
                syncType,
                isAdmin: false
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getSyncLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deviceId } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const logs = await this.syncService.getSyncLogs(deviceId, limit);
            res.json(logs);
        } catch (error) {
            next(error);
        }
    };

    getErrorLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const days = req.query.days ? parseInt(req.query.days as string) : 7;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

            const errorLogs = await this.syncService.getErrorLogs(days, limit);
            res.json(errorLogs);
        } catch (error) {
            next(error);
        }
    };
}

