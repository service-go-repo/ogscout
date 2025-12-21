/**
 * Database Connection Test Script
 *
 * This script tests the MongoDB connection using credentials from .env.production
 *
 * Usage:
 *   node __tests__/db-connection-test.js
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

// Load environment variables from .env.production
function loadEnvProduction() {
  const envPath = path.join(__dirname, '..', '.env.production');

  logSection('Loading Environment Variables');
  logInfo(`Looking for: ${envPath}`);

  if (!fs.existsSync(envPath)) {
    logError('.env.production file not found!');
    logInfo('Expected location: ' + envPath);
    return false;
  }

  logSuccess('.env.production file found');

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    }
  });

  return true;
}

// Test MongoDB connection
async function testConnection() {
  logSection('Testing MongoDB Connection');

  // Check if MONGODB_URI is loaded
  if (!process.env.MONGODB_URI) {
    logError('MONGODB_URI environment variable is not set');
    return false;
  }

  // Mask password in the URI for logging
  const maskedUri = process.env.MONGODB_URI.replace(
    /:([^:@]+)@/,
    ':****@'
  );
  logInfo(`Connection URI: ${maskedUri}`);

  let client;

  try {
    logInfo('Attempting to connect to MongoDB...');

    client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    await client.connect();
    logSuccess('Successfully connected to MongoDB!');

    // Test database access
    logSection('Testing Database Access');
    const db = client.db('repair-connect');
    logInfo('Database name: repair-connect');

    // List collections
    logInfo('Fetching collections...');
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      logWarning('No collections found in database');
    } else {
      logSuccess(`Found ${collections.length} collection(s):`);
      collections.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.name}`);
      });
    }

    // Test a simple query on workshops collection
    logSection('Testing Workshop Collection Query');
    const workshopsCollection = db.collection('workshops');

    try {
      const workshopCount = await workshopsCollection.countDocuments();
      logSuccess(`Workshops collection count: ${workshopCount}`);

      if (workshopCount > 0) {
        const sampleWorkshop = await workshopsCollection.findOne({}, {
          projection: {
            'profile.businessName': 1,
            isActive: 1,
            createdAt: 1
          }
        });

        if (sampleWorkshop) {
          logInfo('Sample workshop document:');
          console.log(JSON.stringify(sampleWorkshop, null, 2));
        }
      }
    } catch (queryError) {
      logWarning('Could not query workshops collection: ' + queryError.message);
    }

    // Test server status
    logSection('Server Status');
    try {
      const admin = db.admin();
      const serverStatus = await admin.serverStatus();
      logSuccess('Server version: ' + serverStatus.version);
      logSuccess('Server uptime: ' + Math.floor(serverStatus.uptime / 3600) + ' hours');
    } catch (statusError) {
      logWarning('Could not fetch server status: ' + statusError.message);
    }

    return true;

  } catch (error) {
    logError('Connection failed!');
    logError('Error type: ' + error.name);
    logError('Error message: ' + error.message);

    if (error.message.includes('authentication')) {
      logWarning('This appears to be an authentication error.');
      logInfo('Check your MongoDB username and password in .env.production');
    } else if (error.message.includes('ENOTFOUND')) {
      logWarning('This appears to be a DNS/hostname error.');
      logInfo('Check your MongoDB host address in .env.production');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      logWarning('This appears to be a network/firewall error.');
      logInfo('Check if your MongoDB server is accessible and firewall rules are correct');
    }

    return false;

  } finally {
    if (client) {
      await client.close();
      logInfo('Connection closed');
    }
  }
}

// Main execution
async function main() {
  console.clear();
  logSection('MongoDB Connection Test');
  logInfo('Testing database credentials from .env.production');
  logInfo('Timestamp: ' + new Date().toISOString());

  // Load environment variables
  const envLoaded = loadEnvProduction();
  if (!envLoaded) {
    process.exit(1);
  }

  // Test connection
  const success = await testConnection();

  // Final summary
  logSection('Test Summary');
  if (success) {
    logSuccess('All tests passed! Database connection is working correctly.');
    process.exit(0);
  } else {
    logError('Tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  logError('Unexpected error: ' + error.message);
  console.error(error);
  process.exit(1);
});
