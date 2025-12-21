/**
 * Database Initialization Script for Local Development
 *
 * This script initializes the MongoDB database with collections and indexes
 * Run this ONCE after setting up your local MongoDB
 *
 * Usage:
 *   node __tests__/db-init.js
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

// Load environment variables from .env.production
function loadEnvProduction() {
  const envPath = path.join(__dirname, '..', '..', '.env.production');

  if (!fs.existsSync(envPath)) {
    logError('.env.production file not found!');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    }
  });

  return true;
}

async function initializeDatabase() {
  logSection('Database Initialization');

  if (!process.env.MONGODB_URI) {
    logError('MONGODB_URI not found in .env.production');
    return false;
  }

  const maskedUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  logInfo(`Using connection: ${maskedUri}`);

  let client;

  try {
    logInfo('Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    logSuccess('Connected to MongoDB');

    const db = client.db('repair-connect');
    logInfo('Database: repair-connect');

    // Create collections with indexes
    logSection('Creating Collections and Indexes');

    // Users collection
    logInfo('Creating users collection...');
    try {
      await db.createCollection('users');
      logSuccess('Created users collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Users collection already exists');
      } else {
        throw error;
      }
    }

    try {
      await db.collection('users').createIndex({ "email": 1 }, { unique: true });
      logSuccess('Created index: users.email (unique)');
    } catch (error) {
      if (error.code === 85) {
        logInfo('Index already exists: users.email');
      } else {
        throw error;
      }
    }

    // Workshops collection
    logInfo('Creating workshops collection...');
    try {
      await db.createCollection('workshops');
      logSuccess('Created workshops collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Workshops collection already exists');
      } else {
        throw error;
      }
    }

    // Create workshop indexes
    const workshopIndexes = [
      { spec: { "userId": 1 }, options: { unique: true }, name: "userId_1" },
      { spec: { "contact.email": 1 }, options: { sparse: true }, name: "contact_email_1" },
      { spec: { "isActive": 1 }, options: {}, name: "isActive_1" },
      { spec: { "contact.location": "2dsphere" }, options: {}, name: "location_2dsphere" }
    ];

    for (const idx of workshopIndexes) {
      try {
        await db.collection('workshops').createIndex(idx.spec, { ...idx.options, name: idx.name });
        logSuccess(`Created index: workshops.${idx.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          logInfo(`Index already exists: workshops.${idx.name}`);
        } else {
          throw error;
        }
      }
    }

    // Cars collection
    logInfo('Creating cars collection...');
    try {
      await db.createCollection('cars');
      await db.collection('cars').createIndex({ "userId": 1 });
      logSuccess('Created cars collection with indexes');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Cars collection already exists');
        await db.collection('cars').createIndex({ "userId": 1 });
        logSuccess('Created index: cars.userId');
      } else {
        throw error;
      }
    }

    // Quotations collection
    logInfo('Creating quotations collection...');
    try {
      await db.createCollection('quotations');
      logSuccess('Created quotations collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Quotations collection already exists');
      } else {
        throw error;
      }
    }

    const quotationIndexes = [
      { spec: { "userId": 1 }, name: "userId_1" },
      { spec: { "workshopId": 1 }, name: "workshopId_1" },
      { spec: { "status": 1 }, name: "status_1" },
      { spec: { "createdAt": -1 }, name: "createdAt_-1" }
    ];

    for (const idx of quotationIndexes) {
      try {
        await db.collection('quotations').createIndex(idx.spec, { name: idx.name });
        logSuccess(`Created index: quotations.${idx.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          logInfo(`Index already exists: quotations.${idx.name}`);
        }
      }
    }

    // Appointments collection
    logInfo('Creating appointments collection...');
    try {
      await db.createCollection('appointments');
      logSuccess('Created appointments collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Appointments collection already exists');
      } else {
        throw error;
      }
    }

    const appointmentIndexes = [
      { spec: { "userId": 1 }, name: "userId_1" },
      { spec: { "workshopId": 1 }, name: "workshopId_1" },
      { spec: { "status": 1 }, name: "status_1" },
      { spec: { "scheduledDate": 1 }, name: "scheduledDate_1" }
    ];

    for (const idx of appointmentIndexes) {
      try {
        await db.collection('appointments').createIndex(idx.spec, { name: idx.name });
        logSuccess(`Created index: appointments.${idx.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          logInfo(`Index already exists: appointments.${idx.name}`);
        }
      }
    }

    // Service Requests collection
    logInfo('Creating serviceRequests collection...');
    try {
      await db.createCollection('serviceRequests');
      logSuccess('Created serviceRequests collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('ServiceRequests collection already exists');
      } else {
        throw error;
      }
    }

    const serviceRequestIndexes = [
      { spec: { "userId": 1 }, name: "userId_1" },
      { spec: { "status": 1 }, name: "status_1" },
      { spec: { "createdAt": -1 }, name: "createdAt_-1" }
    ];

    for (const idx of serviceRequestIndexes) {
      try {
        await db.collection('serviceRequests').createIndex(idx.spec, { name: idx.name });
        logSuccess(`Created index: serviceRequests.${idx.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          logInfo(`Index already exists: serviceRequests.${idx.name}`);
        }
      }
    }

    // Notifications collection
    logInfo('Creating notifications collection...');
    try {
      await db.createCollection('notifications');
      logSuccess('Created notifications collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        logInfo('Notifications collection already exists');
      } else {
        throw error;
      }
    }

    const notificationIndexes = [
      { spec: { "userId": 1 }, name: "userId_1" },
      { spec: { "read": 1 }, name: "read_1" },
      { spec: { "createdAt": -1 }, name: "createdAt_-1" }
    ];

    for (const idx of notificationIndexes) {
      try {
        await db.collection('notifications').createIndex(idx.spec, { name: idx.name });
        logSuccess(`Created index: notifications.${idx.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          logInfo(`Index already exists: notifications.${idx.name}`);
        }
      }
    }

    // Verify collections were created
    logSection('Verification');
    const collections = await db.listCollections().toArray();
    logSuccess(`Total collections: ${collections.length}`);
    collections.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.name}`);
    });

    return true;

  } catch (error) {
    logError('Initialization failed!');
    logError('Error: ' + error.message);
    if (error.code) {
      logError('Error code: ' + error.code);
    }
    console.error(error);
    return false;

  } finally {
    if (client) {
      await client.close();
      logInfo('Connection closed');
    }
  }
}

async function main() {
  console.clear();
  logSection('MongoDB Database Initialization');
  logInfo('This will create collections and indexes for local development');
  logInfo('Timestamp: ' + new Date().toISOString());

  // Load environment variables
  const envLoaded = loadEnvProduction();
  if (!envLoaded) {
    process.exit(1);
  }

  // Initialize database
  const success = await initializeDatabase();

  // Summary
  logSection('Summary');
  if (success) {
    logSuccess('Database initialized successfully!');
    logInfo('You can now use your application with the local database');
    logInfo('Collections and indexes have been created');
    process.exit(0);
  } else {
    logError('Initialization failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the initialization
main().catch(error => {
  logError('Unexpected error: ' + error.message);
  console.error(error);
  process.exit(1);
});
