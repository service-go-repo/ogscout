/**
 * @jest-environment node
 */

const { createMocks } = require('node-mocks-http')
const { POST } = require('../../src/app/api/service-requests/route')

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock MongoDB client
jest.mock('../../lib/db', () => ({
  default: Promise.resolve({
    db: () => ({
      collection: (name) => ({
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn()
      })
    })
  })
}))

// Mock file upload
jest.mock('../../lib/fileUpload', () => ({
  uploadMultipleFiles: jest.fn().mockResolvedValue([
    {
      url: 'https://test.com/photo.jpg',
      publicId: 'test-photo',
      fileSize: 1024,
      width: 800,
      height: 600
    }
  ])
}))

const { getServerSession } = require('next-auth')
const clientPromise = require('../../lib/db')

describe('/api/service-requests POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates service request successfully', async () => {
    // Mock authenticated user
    getServerSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439011', role: 'customer' }
    })

    // Mock database operations
    const mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn()
    }

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    }

    // Setup mock responses
    mockCollection.findOne
      .mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439012',
        make: 'Toyota',
        model: 'Camry',
        year: 2020
      })
      .mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439013',
        title: 'Test Service Request',
        customerId: '507f1f77bcf86cd799439011'
      })

    mockCollection.insertOne.mockResolvedValue({
      insertedId: '507f1f77bcf86cd799439013'
    })

    const mockClientPromise = await clientPromise
    mockClientPromise.db = jest.fn().mockReturnValue(mockDb)

    // Create mock form data
    const formData = new FormData()
    formData.append('carId', '507f1f77bcf86cd799439012')
    formData.append('title', 'Test Service Request')
    formData.append('description', 'Test description')
    formData.append('requestedServices', JSON.stringify(['engine']))
    formData.append('priority', 'medium')
    formData.append('preferredContactMethod', 'email')
    formData.append('serviceLocation', JSON.stringify({
      type: 'customer_location',
      address: 'Test Address'
    }))

    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    // Mock formData method
    req.formData = jest.fn().mockResolvedValue(formData)

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data._id).toBe('507f1f77bcf86cd799439013')
    expect(mockCollection.insertOne).toHaveBeenCalled()
  })

  test('returns error for unauthenticated user', async () => {
    getServerSession.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST'
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  test('returns error for non-customer user', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '507f1f77bcf86cd799439011', role: 'workshop' }
    })

    const { req } = createMocks({
      method: 'POST'
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only customers can create service requests')
  })
})