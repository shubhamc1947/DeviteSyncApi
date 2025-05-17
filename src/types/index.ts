import { Request } from 'express';
import { SyncStatus } from '../enums/SyncStatus';



export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: 'admin' | 'user';
    };
}

export interface DeviceListParams {
    page?: number;
    limit?: number;
    status?: SyncStatus;
    search?: string;
}

export interface SyncRequest {
    deviceId: string;
    force?: boolean;
    syncType?: 'FULL' | 'DELTA';
    userId: number;
    isAdmin: boolean;
}

export interface ErrorResponse {
    status: number;
    message: string;
    stack?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}