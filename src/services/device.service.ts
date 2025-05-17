import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { SyncStatus } from '../enums/SyncStatus';
import { DeviceListParams, PaginatedResponse } from '../types';
import { NotFoundError } from '../middlewares/error.middleware';
import logger from '../config/logger';

export class DeviceService {
    private deviceRepository = AppDataSource.getRepository(Device);

    /**
     * Get a paginated list of devices with optional filtering
     */
    async getDevices(params: DeviceListParams): Promise<PaginatedResponse<Device>> {
        const { page = 1, limit = 10, status, search } = params;

        const queryBuilder = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.syncLogs', 'syncLogs', 'syncLogs.createdAt >= :date', {
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            })
            .orderBy('device.updatedAt', 'DESC');

        // Apply filters
        if (status) {
            queryBuilder.andWhere('device.syncStatus = :status', { status });
        }

        if (search) {
            queryBuilder.andWhere(
                '(device.deviceId ILIKE :search OR device.deviceName ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);

        // Execute query
        const devices = await queryBuilder.getMany();

        return {
            data: devices,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get a device by ID
     */
    async getDeviceById(id: string): Promise<Device> {
        const device = await this.deviceRepository.findOne({
            where: { id },
            relations: ['syncLogs']
        });

        if (!device) {
            throw new NotFoundError(`Device with ID ${id} not found`);
        }

        return device;
    }

    /**
     * Get a device by deviceId
     */
    async getDeviceByDeviceId(deviceId: string): Promise<Device> {
        const device = await this.deviceRepository.findOne({
            where: { deviceId },
            relations: ['syncLogs']
        });
        console.log('hiiiiiiiiiiiiii')

        if (!device) {
            throw new NotFoundError(`Device with deviceId ${deviceId} not found`);
        }

        return device;
    }

    /**
     * Create a new device
     */
    async checkDeviceByDeviceId(deviceId: string): Promise<Device | null> {
        return await this.deviceRepository.findOne({
            where: { deviceId },
            relations: ['syncLogs']
        });
    }


    async createDevice(deviceData: Partial<Device>): Promise<Device> {
        const device = this.deviceRepository.create(deviceData);
        await this.deviceRepository.save(device);

        logger.info(`Device created: ${device.deviceId}`);
        return device;
    }

    /**
     * Update a device
     */
    async updateDevice(id: string, deviceData: Partial<Device>): Promise<Device> {
        const device = await this.getDeviceById(id);

        // Update device properties
        Object.assign(device, deviceData);

        await this.deviceRepository.save(device);
        logger.info(`Device updated: ${device.deviceId}`);

        return device;
    }

    /**
     * Update a device sync status
     */
    async updateDeviceSyncStatus(id: string, status: SyncStatus, lastSyncTime?: Date): Promise<Device> {
        const device = await this.getDeviceById(id);

        device.syncStatus = status;
        if (lastSyncTime) {
            device.lastSyncTime = lastSyncTime;
        }

        await this.deviceRepository.save(device);
        logger.info(`Device ${device.deviceId} sync status updated to ${status}`);

        return device;
    }

    /**
     * Get devices with sync failures (for error logs view)
     */
    async getDevicesWithSyncFailures(): Promise<Device[]> {
        const devices = await this.deviceRepository
            .createQueryBuilder('device')
            .where('device.syncStatus = :status', { status: SyncStatus.FAILED })
            .orderBy('device.lastSyncTime', 'DESC')
            .getMany();

        return devices;
    }

    async getUserDeviceByDeviceId(deviceId: string, userId: number): Promise<Device> {
        const device = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.user', 'user')
            .where('device.deviceId = :deviceId', { deviceId })
            .andWhere('user.id = :userId', { userId })
            .getOne();

        if (!device) {
            throw new NotFoundError('Device not found for this user');
        }

        return device;
    }


}