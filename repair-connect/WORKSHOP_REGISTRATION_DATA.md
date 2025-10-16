# Workshop Registration Data Retrieval System

## Overview

The workshop registration data retrieval system automatically detects and imports business information that was entered during the workshop signup process, eliminating the need to re-enter data when setting up the workshop profile.

## How It Works

### 1. **Data Storage During Registration**

When a workshop owner completes the registration form (`/auth/register`), the following data is stored in the `users` collection:

```typescript
// Workshop User Document Structure
{
  _id: ObjectId,
  email: string,
  role: 'workshop',
  businessInfo: {
    businessName: string,
    businessType: 'auto_repair' | 'body_shop' | 'tire_service' | 'oil_change' | 'specialty',
    businessPhone: string,
    businessAddress: {
      street: string,
      city: string, 
      state: string,
      zipCode: string
    },
    businessHours: {
      monday: { open: string, close: string, closed: boolean },
      tuesday: { open: string, close: string, closed: boolean },
      // ... for each day of the week
    },
    servicesOffered: string[],
    businessLicense: string,
    insuranceInfo: string
  },
  ownerInfo: {
    firstName: string,
    lastName: string,
    phone: string
  }
}
```

### 2. **Migration API Endpoints**

#### **Check Migration Status**
```http
GET /api/workshops/profile/migrate
```

**Response:**
```json
{
  "success": true,
  "hasExistingProfile": false,
  "canMigrate": true,
  "registrationData": {
    "businessName": "AutoCare Pro Services",
    "businessType": "auto_repair",
    "businessPhone": "+1 (555) 123-4567",
    "businessAddress": {
      "street": "1234 Main Street",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701"
    },
    "servicesOffered": ["Engine Repair", "Brake Service", "Oil Change"],
    "businessHours": { /* ... */ },
    "businessLicense": "IL-AUTO-2024-001234",
    "insuranceInfo": "State Farm Commercial Auto Insurance",
    "ownerInfo": {
      "firstName": "John",
      "lastName": "Smith",
      "phone": "+1 (555) 987-6543"
    }
  }
}
```

#### **Perform Migration**
```http
POST /api/workshops/profile/migrate
```

**Response:**
```json
{
  "success": true,
  "message": "Workshop profile created successfully from registration data",
  "workshop": { /* Complete workshop profile */ },
  "migrated": true,
  "migratedData": { /* Original registration data */ }
}
```

### 3. **Data Transformation Process**

The migration system automatically transforms registration data into the workshop profile format:

| Registration Field | Workshop Profile Field | Transformation |
|-------------------|----------------------|----------------|
| `businessInfo.businessName` | `profile.businessName` | Direct mapping |
| `businessInfo.businessType` | `profile.description` | Converted to description |
| `businessInfo.servicesOffered` | `profile.specializations.serviceTypes` | Mapped to service type enums |
| `businessInfo.businessHours` | `profile.operatingHours` | Restructured format |
| `businessInfo.businessAddress` | `contact.address` | Concatenated string |
| `businessInfo.businessPhone` | `contact.phone` | Direct mapping |
| `ownerInfo` | `owner` | Direct mapping |
| `businessInfo.businessLicense` | `verification.businessLicense` | Structured verification |

## Usage

### 1. **Automatic Detection**

When a workshop user accesses their profile settings (`/profile`), the system automatically:

1. Checks if a workshop profile already exists
2. If no profile exists, displays the registration data migrator
3. Shows a preview of available registration data
4. Provides a one-click import button

### 2. **Manual Access**

You can also access the migration system through:

- **Profile Settings**: `/profile` (automatic detection)
- **Migration Demo**: `/migration-demo` (interactive demonstration)
- **Workshop Management Hub**: `/workshop-management` (navigation hub)

### 3. **Component Integration**

```tsx
import RegistrationDataMigrator from '@/components/workshops/registration-data-migrator'

<RegistrationDataMigrator 
  onMigrationComplete={() => {
    // Refresh profile data
    fetchWorkshopProfile()
  }}
/>
```

## Features

### ✅ **Automatic Detection**
- Detects existing registration data
- Shows migration status
- Prevents duplicate profiles

### ✅ **Data Preview**
- Visual preview of registration data
- Organized by categories (business, services, hours, owner)
- Shows exactly what will be imported

### ✅ **One-Click Import**
- Single button to import all data
- Automatic data transformation
- Error handling and validation

### ✅ **Smart Mapping**
- Services mapped to standardized types
- Business hours converted to profile format
- Address information properly structured

### ✅ **Verification Integration**
- Business license information preserved
- Insurance details maintained
- Owner information linked

## Navigation

### **Direct URLs**
- Profile Settings: `http://localhost:3004/profile`
- Migration Demo: `http://localhost:3004/migration-demo`
- Workshop Hub: `http://localhost:3004/workshop-management`

### **Navigation Menu**
For workshop users, the header navigation includes:
- **Profile Settings** → Main profile management
- **Demo** → Feature demonstrations

## Benefits

1. **Time Saving**: No need to re-enter business information
2. **Accuracy**: Reduces data entry errors
3. **Seamless Flow**: Smooth transition from signup to profile
4. **Data Consistency**: Maintains integrity across systems
5. **User Experience**: Intuitive one-click import process

## Technical Implementation

### **Authentication Required**
- Only authenticated workshop users can access migration endpoints
- Session validation on all API calls
- Role-based authorization (workshop role only)

### **Data Validation**
- Registration data validation before migration
- Workshop profile schema validation
- Error handling for missing or invalid data

### **Database Operations**
- Reads from `users` collection (registration data)
- Creates documents in `workshops` collection (profile data)
- Geospatial indexing for location-based features
- Atomic operations to prevent data corruption

## Error Handling

The system handles various scenarios:

- **No Registration Data**: Shows appropriate message
- **Existing Profile**: Prevents duplicate creation
- **Invalid Data**: Validation errors with specific messages
- **Database Errors**: Graceful error handling with retry options
- **Authentication Issues**: Proper authorization checks

## Future Enhancements

1. **Partial Migration**: Allow selective import of specific data sections
2. **Data Sync**: Keep registration and profile data synchronized
3. **Bulk Migration**: Admin tools for migrating multiple workshops
4. **Data Validation**: Enhanced validation rules and data cleaning
5. **Audit Trail**: Track migration history and changes

---

The workshop registration data retrieval system provides a seamless bridge between the initial signup process and the comprehensive profile management system, ensuring workshop owners can quickly get their profiles set up with minimal effort.
