import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { SyncLog } from './SyncLog';
import { SyncStatus } from '../enums/SyncStatus';
import { User } from './User';


@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    deviceId: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    deviceName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    location: string;

    @Column({
        type: 'enum',
        enum: SyncStatus,
        enumName: 'sync_status_enum', // 🔥 Must match exactly in both entities
        default: SyncStatus.PENDING,  // Only needed in Device
    })
    syncStatus: SyncStatus;

    @Column({ type: 'timestamp', nullable: true })
    lastSyncTime: Date;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => SyncLog, syncLog => syncLog.device)
    syncLogs: SyncLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, User => User.devices)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
}