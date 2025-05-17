// entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Device } from './Device';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    password: string; // Hashed

    @Column({ type: 'varchar', default: 'user' }) // or 'admin'
    role: 'admin' | 'user';

    @OneToMany(() => Device, device => device.user)
    devices: Device[];
}
