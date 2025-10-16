// Standalone Jest config that doesn't load Next.js config to avoid worker conflicts
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx'
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
  // Run tests in single thread to avoid worker process issues
  maxWorkers: 1,
  // Prevent memory issues
  workerIdleMemoryLimit: '512MB',
  // Add explicit transform to handle ES modules
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ]
    }]
  },
  // Ignore node_modules except for ES modules that need transformation
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
}