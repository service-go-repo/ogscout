# Database Connection Test

This directory contains test scripts to verify MongoDB connection credentials.

## Files

- `db-connection-test.js` - JavaScript version (Node.js)
- `db-connection-test.ts` - TypeScript version (requires tsx or ts-node)

## Usage

### Using JavaScript version:

```bash
node __tests__/db-connection-test.js
```

### Using TypeScript version:

```bash
npx tsx __tests__/db-connection-test.ts
```

Or add to your `package.json` scripts:

```json
{
  "scripts": {
    "test:db": "node __tests__/db-connection-test.js",
    "test:db:ts": "npx tsx __tests__/db-connection-test.ts"
  }
}
```

Then run:

```bash
npm run test:db
```

## What it Tests

1. **Environment Variables Loading**
   - Loads credentials from `.env.production`
   - Validates MONGODB_URI is present

2. **MongoDB Connection**
   - Attempts to connect using production credentials
   - Tests connection with 10-second timeout
   - Provides detailed error messages for common issues

3. **Database Access**
   - Lists all collections in the database
   - Counts documents in key collections (workshops, users)
   - Fetches sample documents for verification

4. **Server Status**
   - Retrieves MongoDB server version
   - Shows server uptime and connection count

## Output

The script provides color-coded output:
- ✓ Green = Success
- ✗ Red = Error
- ⚠ Yellow = Warning
- ℹ Blue = Info

## Common Errors and Solutions

### Authentication Error
```
Error message: Authentication failed
```
**Solution:** Check your MongoDB username and password in `.env.production`

### DNS/Hostname Error
```
Error message: getaddrinfo ENOTFOUND
```
**Solution:** Check your MongoDB host address in `.env.production`

### Network/Timeout Error
```
Error message: ETIMEDOUT or ECONNREFUSED
```
**Solution:**
- Check if MongoDB server is running
- Verify firewall rules allow connection
- Check if your IP is whitelisted (for MongoDB Atlas)

## Requirements

- Node.js 16+
- mongodb npm package (already in your dependencies)
- `.env.production` file in project root

## Example Output

```
============================================================
MongoDB Connection Test
============================================================
ℹ Testing database credentials from .env.production
ℹ Timestamp: 2025-01-20T10:30:45.123Z

============================================================
Loading Environment Variables
============================================================
ℹ Looking for: C:\path\to\.env.production
✓ .env.production file found

============================================================
Testing MongoDB Connection
============================================================
ℹ Connection URI: mongodb+srv://username:****@cluster.mongodb.net/...
ℹ Attempting to connect to MongoDB...
✓ Successfully connected to MongoDB!

============================================================
Testing Database Access
============================================================
ℹ Database name: repair-connect
ℹ Fetching collections...
✓ Found 5 collection(s):
  1. users
  2. workshops
  3. appointments
  4. quotations
  5. notifications

============================================================
Test Summary
============================================================
✓ All tests passed! Database connection is working correctly.
```
