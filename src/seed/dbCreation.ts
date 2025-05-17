import { Client } from 'pg';

async function ensureDatabaseExists() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: 'postgres' // connect to default database first
    });

    await client.connect();

    const dbName = process.env.DB_DATABASE || 'pisync_db';

    const result = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
    );

    if (result.rowCount === 0) {
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database '${dbName}' created`);
    } else {
        console.log(`ℹ️ Database '${dbName}' already exists`);
    }

    await client.end();
}

export { ensureDatabaseExists };