// sync.routes.ts
import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authenticateAdmin, authenticateUser } from '../middlewares/auth.middleware';

const router = Router();
const syncController = new SyncController();


// 🧑‍ User route
router.post('/user/:deviceId', authenticateUser, syncController.userTriggerSync);

// 👨‍💼 Admin monitor-only routes
router.get('/admin/:deviceId/logs', authenticateAdmin, syncController.getSyncLogs);
router.get('/admin/errors', authenticateAdmin, syncController.getErrorLogs);

export default router;
