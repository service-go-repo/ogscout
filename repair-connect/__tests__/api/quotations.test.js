/**
 * @jest-environment node
 */

const { createMocks } = require('node-mocks-http')
const { POST } = require('../../src/app/api/quotations/route')

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock MongoDB client
jest.mock('../../lib/mongodb', () => ({
  connectToDatabase: jest.fn()
}))

const { getServerSession } = require('next-auth')
const { connectToDatabase } = require('../../lib/mongodb')

describe('/api/quotations POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates quotation and links to service request', async () => {
    // Mock authenticated customer
    getServerSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439011', role: 'customer' }
    })

    // Mock collections with persistent objects
    const mockCollections = {
      users: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'Test User',
          email: 'test@example.com'
        })
      },
      cars: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439012',
          basicInfo: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Blue',
            vin: '1234567890',
            licensePlate: 'ABC123'
          }
        })
      },
      quotations: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439014',
          customerId: '507f1f77bcf86cd799439011',
          selectedCarId: '507f1f77bcf86cd799439012',
          requestedServices: ['engine'],
          damageDescription: 'Engine issue',
          status: 'active',
          createdAt: new Date()
        }),
        insertOne: jest.fn().mockResolvedValue({
          insertedId: '507f1f77bcf86cd799439014'
        }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      },
      servicerequests: {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      },
      notifications: {
        insertMany: jest.fn().mockResolvedValue({})
      }
    }

    // Mock database
    const mockDb = {
      client: {
        startSession: jest.fn().mockReturnValue({
          withTransaction: jest.fn().mockImplementation(async (callback) => {
            await callback()
          }),
          endSession: jest.fn()
        })
      },
      collection: jest.fn((collectionName) => {
        return mockCollections[collectionName] || {
          findOne: jest.fn(),
          insertOne: jest.fn().mockResolvedValue({
            insertedId: '507f1f77bcf86cd799439014'
          }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          }),
          insertMany: jest.fn().mockResolvedValue({})
        }
      })
    }

    connectToDatabase.mockResolvedValue({ db: mockDb })

    const { req } = createMocks({
      method: 'POST'
    })

    // Mock request.json() method
    req.json = jest.fn().mockResolvedValue({
      selectedCarId: '507f1f77bcf86cd799439012',
      requestedServices: ['engine'],
      damageDescription: 'Engine issue',
      location: {
        coordinates: [55.3781, 25.1772]
      },
      address: 'Test Address',
      city: 'Dubai',
      state: 'Dubai',
      sourceServiceRequestId: '507f1f77bcf86cd799439013', // Link to service request
      targetWorkshops: ['507f1f77bcf86cd799439015']
    })

    const response = await POST(req)
    const data = await response.json()

    if (response.status !== 201) {
      console.log('Response status:', response.status)
      console.log('Response data:', data)
    }

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)

    // Verify service request was updated
    expect(mockCollections.servicerequests.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      {
        $set: {
          status: 'quoted',
          updatedAt: expect.any(Date)
        }
      },
      { session: expect.any(Object) }
    )

    // Verify notifications were created
    expect(mockCollections.notifications.insertMany).toHaveBeenCalled()
  })

  test('creates quotation without service request link', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439011', role: 'customer' }
    })

    // Mock collections with persistent objects
    const mockCollections = {
      users: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'Test User',
          email: 'test@example.com'
        })
      },
      cars: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439012',
          basicInfo: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Blue',
            vin: '1234567890',
            licensePlate: 'ABC123'
          }
        })
      },
      quotations: {
        findOne: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439014',
          customerId: '507f1f77bcf86cd799439011',
          selectedCarId: '507f1f77bcf86cd799439012',
          requestedServices: ['engine'],
          damageDescription: 'Engine issue',
          status: 'active',
          createdAt: new Date()
        }),
        insertOne: jest.fn().mockResolvedValue({
          insertedId: '507f1f77bcf86cd799439014'
        }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      },
      servicerequests: {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      },
      notifications: {
        insertMany: jest.fn().mockResolvedValue({})
      }
    }

    // Mock database
    const mockDb = {
      client: {
        startSession: jest.fn().mockReturnValue({
          withTransaction: jest.fn().mockImplementation(async (callback) => {
            await callback()
          }),
          endSession: jest.fn()
        })
      },
      collection: jest.fn((collectionName) => {
        return mockCollections[collectionName] || {
          findOne: jest.fn(),
          insertOne: jest.fn().mockResolvedValue({
            insertedId: '507f1f77bcf86cd799439014'
          }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          }),
          insertMany: jest.fn().mockResolvedValue({})
        }
      })
    }

    connectToDatabase.mockResolvedValue({ db: mockDb })

    const { req } = createMocks({
      method: 'POST'
    })

    // Mock request.json() method
    req.json = jest.fn().mockResolvedValue({
      selectedCarId: '507f1f77bcf86cd799439012',
      requestedServices: ['engine'],
      damageDescription: 'Engine issue',
      location: {
        coordinates: [55.3781, 25.1772]
      },
      address: 'Test Address',
      city: 'Dubai',
      state: 'Dubai'
      // No sourceServiceRequestId
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)

    // Should not update service request when no link provided
    expect(mockCollections.servicerequests.updateOne).not.toHaveBeenCalled()
  })
})