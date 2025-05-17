import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './Device';
import { SyncStatus } from '../enums/SyncStatus';
console.log('SyncStatus:', SyncStatus);

@Entity('sync_logs')
export class SyncLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    deviceId: string;

    @ManyToOne(() => Device, device => device.syncLogs)
    @JoinColumn({ name: 'deviceId' })
    device: Device;

    @Column({
        type: 'enum',
        enum: SyncStatus,
        enumName: 'sync_status_enum', // 🔥 Must match exactly in both entities
    })
    status: SyncStatus;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'jsonb', nullable: true })
    syncData: any;

    @CreateDateColumn()
    createdAt: Date;
}