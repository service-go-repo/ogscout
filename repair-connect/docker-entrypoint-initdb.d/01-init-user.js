// MongoDB Initialization Script
// Creates the repair-connect database and admin user
// This runs when MongoDB container starts for the first time

print('Starting MongoDB initialization...');

// Switch to the repair-connect database
db = db.getSiblingDB('repair-connect');

// Create admin user with dbOwner role (same as standalone setup)
print('Creating admin user...');
db.createUser({
  user: 'ogscout',
  pwd: 'b2dTY291dDQxMA==',
  roles: [
    { role: 'dbOwner', db: 'repair-connect' }
  ]
});

print('✓ Admin user created successfully!');
print('');
print('Database Configuration:');
print('  Database: repair-connect');
print('  Username: admin');
print('  Password: admin');
print('  Role: dbOwner');
print('');
print('Connection String:');
print('  mongodb://admin:admin@mongodb:27017/repair-connect');
print('');
print('✅ MongoDB initialization completed!');
