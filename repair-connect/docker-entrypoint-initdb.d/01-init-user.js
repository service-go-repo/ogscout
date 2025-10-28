// MongoDB Initialization Script for Docker Compose
// This script runs when MongoDB container starts for the first time
// Creates application user and indexes

print('Starting MongoDB initialization...');

// Switch to the repair-connect database
db = db.getSiblingDB('repair-connect');

// Create application user
print('Creating application user...');
db.createUser({
  user: 'ogscout',
  pwd: 'ogScout410',  // For Docker Compose local development
  roles: [
    {
      role: 'readWrite',
      db: 'repair-connect'
    },
    {
      role: 'dbAdmin',
      db: 'repair-connect'
    }
  ]
});

print('Application user created successfully!');

// Create indexes for better performance
print('Creating indexes...');

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true });
print('✓ Created unique index on users.email');

// Workshops collection
db.workshops.createIndex({ "email": 1 }, { unique: true });
print('✓ Created unique index on workshops.email');

// Cars collection
db.cars.createIndex({ "userId": 1 });
print('✓ Created index on cars.userId');

// Quotations collection
db.quotations.createIndex({ "userId": 1 });
db.quotations.createIndex({ "workshopId": 1 });
db.quotations.createIndex({ "status": 1 });
db.quotations.createIndex({ "createdAt": -1 });
print('✓ Created indexes on quotations');

// Appointments collection
db.appointments.createIndex({ "userId": 1 });
db.appointments.createIndex({ "workshopId": 1 });
db.appointments.createIndex({ "status": 1 });
db.appointments.createIndex({ "scheduledDate": 1 });
print('✓ Created indexes on appointments');

// Service Requests collection
db.serviceRequests.createIndex({ "userId": 1 });
db.serviceRequests.createIndex({ "status": 1 });
db.serviceRequests.createIndex({ "createdAt": -1 });
print('✓ Created indexes on serviceRequests');

print('MongoDB initialization completed successfully!');
print('');
print('Connection Details:');
print('  Database: repair-connect');
print('  Username: ogscout');
print('  Password: ogScout410');
print('  Connection String: mongodb://ogscout:ogScout410@mongodb:27017/repair-connect?authSource=repair-connect');
print('');
print('✅ User credentials match Kubernetes production configuration');
