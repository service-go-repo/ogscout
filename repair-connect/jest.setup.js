// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.CLOUDINARY_CLOUD_NAME = 'test'
process.env.CLOUDINARY_API_KEY = 'test'
process.env.CLOUDINARY_API_SECRET = 'test'