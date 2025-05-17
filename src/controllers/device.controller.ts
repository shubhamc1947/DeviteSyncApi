import { Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/device.service';
import { DeviceListParams } from '../types';
import { SyncStatus } from '../enums/SyncStatus';
import { ValidationError } from '../middlewares/error.middleware';

export class DeviceController {
    private deviceService = new DeviceService();

    /**
     * Get all devices with pagination and filtering
     */
    getDevices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params: DeviceListParams = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                search: req.query.search as string,
                status: req.query.status as SyncStatus
            };

            const devices = await this.deviceService.getDevices(params);
            res.json(devices);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a device by ID
     */
    getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const device = await this.deviceService.getDeviceById(id);
            res.json(device);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a device by deviceId
     */
    getDeviceByDeviceId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deviceId } = req.params;
            const device = await this.deviceService.getDeviceByDeviceId(deviceId);
            res.json(device);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new device
     */
    createDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deviceId, deviceName, location } = req.body;
            if (!deviceId) {
                throw new ValidationError('Device ID is required');
            }

            // Get userId from authenticated user (make sure your auth middleware sets req.user)
            const userId = (req as any).user?.id;
            if (!userId) {
                // You can respond with 401 Unauthorized or your preferred error handling
                return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            }

            console.log(deviceId);
            const existingDevice = await this.deviceService.checkDeviceByDeviceId(deviceId);
            if (existingDevice) {
                return res.status(400).json({ message: `Device with deviceId "${deviceId}" already exists.` });
            }

            const device = await this.deviceService.createDevice({
                deviceId,
                deviceName,
                location,
                userId // pass userId here
            });

            res.status(201).json(device);
        } catch (error) {
            next(error);
        }
    };


    /**
     * Update a device
     */
    updateDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { deviceName, location, isActive } = req.body;

            const device = await this.deviceService.updateDevice(id, {
                deviceName,
                location,
                isActive
            });

            res.json(device);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get devices with sync failures
     */
    getDevicesWithSyncFailures = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const devices = await this.deviceService.getDevicesWithSyncFailures();
            res.json(devices);
        } catch (error) {
            next(error);
        }
    };
}