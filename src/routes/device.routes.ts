import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = Router();
const deviceController = new DeviceController();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// GET /api/devices - Get all devices with pagination and filtering
router.get('/', deviceController.getDevices);

// GET /api/devices/failures - Get devices with sync failures
router.get('/failures', deviceController.getDevicesWithSyncFailures);

// GET /api/devices/:id - Get a device by ID
router.get('/:id', deviceController.getDeviceById);

// GET /api/devices/by-device-id/:deviceId - Get a device by deviceId
router.get('/by-device-id/:deviceId', deviceController.getDeviceByDeviceId);

// POST /api/devices - Create a new device
router.post('/', deviceController.createDevice);

// PUT /api/devices/:id - Update a device
router.put('/:id', deviceController.updateDevice);

export default router;