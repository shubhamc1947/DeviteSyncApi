PiSync Admin Dashboard Backend
This is the backend server for the PiSync Admin Dashboard, built with Node.js, TypeScript, Express, and PostgreSQL with TypeORM.

System Architecture
The PiSync system consists of three main components:

PiSync Devices: PiBook and PiBox devices that sync offline learning data to the cloud when internet connectivity is available.
PiSync Backend API: The Node.js/Express backend that handles device registration, sync requests, and error logging.
PiSync Admin Dashboard: A React/Next.js frontend application used by administrators to monitor sync status and manage devices.
Features
Device management API (list, create, update)
Sync triggering and status tracking
Error logging and monitoring
Pagination and filtering for device lists
Authentication and authorization (JWT-based)
Database seeding for development
Requirements
Node.js (v14+)
PostgreSQL (v12+)
npm or yarn
Installation
Clone the repository:
bash
git clone <repository-url>
cd pisync-backend
Install dependencies:
bash
npm install
Configure environment variables:
Copy .env.example to .env
Update the database connection settings and other configurations
Set up the database:
bash
# Create database (in PostgreSQL)
createdb pisync_db

# Run migrations (in the future if implemented)
# npm run migrate
Seed the database with sample data (optional):
bash
npm run seed
Development
Start the development server:

bash
npm run dev
The server will start on port 3000 (or the port specified in your .env file).

Production
Build the application:

bash
npm run build
Start the production server:

bash
npm start
API Endpoints
Device Management
GET /api/devices - Get a list of devices (paginated)
GET /api/devices/:id - Get a device by ID
GET /api/devices/by-device-id/:deviceId - Get a device by deviceId
POST /api/devices - Create a new device
PUT /api/devices/:id - Update a device
GET /api/devices/failures - Get devices with sync failures
Sync Management
POST /api/sync/:deviceId - Trigger a sync for a device
GET /api/sync/:deviceId/logs - Get sync logs for a specific device
GET /api/sync/errors - Get error logs across all devices
Scaling Considerations
For handling 50,000 devices syncing daily, consider:

Database Optimization:
Implement database sharding/partitioning
Use connection pooling
Optimize indexes
Implement query caching
API Performance:
Add Redis caching for frequently accessed data
Implement pagination for all list endpoints
Use efficient data serialization
Architecture Improvements:
Adopt a microservices architecture for better scaling
Use message queues (RabbitMQ/Kafka) for sync requests
Implement a worker system for processing sync jobs
Infrastructure:
Set up horizontal scaling for the API servers
Implement load balancing
Use a CDN for static assets
Set up database read replicas
Monitoring and Maintenance:
Implement comprehensive monitoring and alerting
Set up automated backups and disaster recovery
Use proper logging and error tracking systems
