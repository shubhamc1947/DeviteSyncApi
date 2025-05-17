// services/sync.service.ts
import { AppDataSource } from '../config/database';
import { SyncLog } from '../entities/SyncLog';
import { Device } from '../entities/Device';
import { SyncStatus } from '../enums/SyncStatus';
import { DeviceService } from './device.service';
import { SyncRequest } from '../types';
import { NotFoundError } from '../middlewares/error.middleware';
import logger from '../config/logger';

export class SyncService {
    private syncLogRepository = AppDataSource.getRepository(SyncLog);
    private deviceService = new DeviceService();

    // sync.service.ts

    async triggerSync(syncRequest: SyncRequest): Promise<{ success: boolean; message: string }> {
        const { deviceId, force = false, syncType = 'DELTA', userId, isAdmin = false } = syncRequest;

        try {
            const device = await this.deviceService.getUserDeviceByDeviceId(deviceId, userId);

            if (device.syncStatus === SyncStatus.PENDING && !force) {
                return { success: false, message: 'Sync already in progress for this device' };
            }

            await this.deviceService.updateDeviceSyncStatus(device.id, SyncStatus.PENDING);

            const syncLog = this.syncLogRepository.create({
                deviceId: device.id,
                status: SyncStatus.PENDING,
                syncData: { syncType, triggeredAt: new Date(), forcedSync: force }
            });

            await this.syncLogRepository.save(syncLog);

            setTimeout(async () => {
                try {
                    const success = Math.random() < 0.8;
                    const now = new Date();

                    if (success) {
                        await this.deviceService.updateDeviceSyncStatus(device.id, SyncStatus.SUCCESS, now);
                        syncLog.status = SyncStatus.SUCCESS;
                        syncLog.syncData = {
                            ...syncLog.syncData,
                            completedAt: now,
                            bytesTransferred: Math.floor(Math.random() * 1024 * 1024),
                            filesTransferred: Math.floor(Math.random() * 50)
                        };
                    } else {
                        await this.deviceService.updateDeviceSyncStatus(device.id, SyncStatus.FAILED, now);
                        syncLog.status = SyncStatus.FAILED;
                        syncLog.errorMessage = 'Connection timeout during file transfer';
                        syncLog.syncData = {
                            ...syncLog.syncData,
                            failedAt: now,
                            bytesTransferred: Math.floor(Math.random() * 512 * 1024),
                            errorCode: 'TIMEOUT'
                        };
                    }

                    await this.syncLogRepository.save(syncLog);
                    logger.info(`Sync completed for device ${deviceId} with status ${syncLog.status}`);
                } catch (error) {
                    logger.error(`Error in sync process for device ${deviceId}:`, error);
                }
            }, 5000);

            return { success: true, message: `Sync triggered for device ${deviceId}` };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Failed to trigger sync:`, error);
            throw new Error(`Failed to trigger sync: ${(error as Error).message}`);
        }
    }


    async getSyncLogs(deviceId: string, limit = 10): Promise<SyncLog[]> {
        const device = await this.deviceService.getDeviceByDeviceId(deviceId);
        return this.syncLogRepository.find({
            where: { deviceId: device.id },
            order: { createdAt: 'DESC' },
            take: limit
        });
    }

    async getErrorLogs(days = 7, limit = 50): Promise<SyncLog[]> {
        const date = new Date();
        date.setDate(date.getDate() - days);

        return this.syncLogRepository
            .createQueryBuilder('syncLog')
            .leftJoinAndSelect('syncLog.device', 'device')
            .where('syncLog.status = :status', { status: SyncStatus.FAILED })
            .andWhere('syncLog.createdAt >= :date', { date })
            .orderBy('syncLog.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }
}
