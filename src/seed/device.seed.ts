import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { SyncLog } from '../entities/SyncLog';
import logger from '../config/logger';
import { SyncStatus } from '../enums/SyncStatus';

/**
 * Generates random device data for development and testing
 */
async function seedDevices() {
    try {
        // Wait for data source initialization
        await AppDataSource.initialize();
        logger.info('Database connection initialized.');

        // Count existing devices
        const deviceCount = await AppDataSource.getRepository(Device).count();
        if (deviceCount > 0) {
            logger.info(`Database already has ${deviceCount} devices. Skipping seed.`);
            return;
        }

        // Generate 20 random devices
        const deviceLocations = ['School A', 'School B', 'School C', 'Community Center', 'Library'];
        const devices: Device[] = [];

        for (let i = 1; i <= 20; i++) {
            const deviceId = `PI${String(i).padStart(4, '0')}`;
            const randomStatus = Math.random();
            let syncStatus: SyncStatus;

            // 70% success, 20% failure, 10% pending
            if (randomStatus < 0.7) {
                syncStatus = SyncStatus.SUCCESS;
            } else if (randomStatus < 0.9) {
                syncStatus = SyncStatus.FAILED;
            } else {
                syncStatus = SyncStatus.PENDING;
            }

            // Random date within the last month
            const lastSyncTime = new Date();
            lastSyncTime.setDate(lastSyncTime.getDate() - Math.floor(Math.random() * 30));

            devices.push({
                deviceId,
                deviceName: `PiBook-${deviceId}`,
                location: deviceLocations[Math.floor(Math.random() * deviceLocations.length)],
                syncStatus,
                lastSyncTime: syncStatus !== SyncStatus.PENDING ? lastSyncTime : undefined
            });
        }

        // Save devices to database
        const savedDevices = await AppDataSource.getRepository(Device).save(devices);
        logger.info(`Created ${savedDevices.length} devices`);

        // Create sync logs for each device
        const syncLogs: Array<Partial<SyncLog>> = [];

        for (const device of savedDevices) {
            // Create 1-5 sync logs per device
            const logCount = Math.floor(Math.random() * 5) + 1;

            for (let i = 0; i < logCount; i++) {
                const logDate = new Date();
                logDate.setDate(logDate.getDate() - i);

                // Most logs match current device status, some are different
                const matchStatus = Math.random() < 0.8;
                const status = matchStatus ? device.syncStatus :
                    (Math.random() < 0.5 ? SyncStatus.SUCCESS : SyncStatus.FAILED);

                syncLogs.push({
                    deviceId: device.id,
                    status,
                    createdAt: logDate,
                    errorMessage: status === SyncStatus.FAILED ? getRandomErrorMessage() : null,
                    syncData: {
                        syncType: Math.random() < 0.8 ? 'DELTA' : 'FULL',
                        bytesTransferred: Math.floor(Math.random() * 1024 * 1024),
                        filesTransferred: Math.floor(Math.random() * 50),
                        duration: Math.floor(Math.random() * 300)
                    }
                });
            }
        }

        // Save sync logs to database
        await AppDataSource.getRepository(SyncLog).save(syncLogs);
        logger.info(`Created ${syncLogs.length} sync logs`);

        logger.info('Seed completed successfully!');
    } catch (error) {
        logger.error('Error seeding database:', error);
    } finally {
        // Close connection
        await AppDataSource.destroy();
    }
}

function getRandomErrorMessage(): string {
    const errors = [
        'Connection timeout during file transfer',
        'Device storage full',
        'Network connection lost',
        'Authentication failed',
        'Data corruption detected',
        'Sync process interrupted',
        'Device powered off during sync',
        'File permission error'
    ];

    return errors[Math.floor(Math.random() * errors.length)];
}

// Run seed if executed directly
if (require.main === module) {
    seedDevices().catch(error => {
        logger.error('Seed failed:', error);
        process.exit(1);
    });
}

export default seedDevices;