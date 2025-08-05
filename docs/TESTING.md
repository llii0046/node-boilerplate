# Testing Guide

This document provides comprehensive information about running tests in the Node.js boilerplate project.

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Running Specific Tests

### 1. Run Tests by File Path

Run a specific test file:
```bash
npm test -- --testPathPatterns="user.service.test.ts"
```

Run all tests in a directory:
```bash
npm test -- --testPathPatterns="unit"
npm test -- --testPathPatterns="integration"
```

### 2. Run Tests by Name Pattern

Run tests matching a specific name:
```bash
npm test -- --testNamePattern="should return user when found"
npm test -- --testNamePattern="UserService"
npm test -- --testNamePattern="should throw"
```

### 3. Run Tests by File and Name

Combine both patterns for precise targeting:
```bash
npm test -- --testPathPatterns="user.service.test.ts" --testNamePattern="should return user when found"
```

### 4. Run Tests with Jest Directly

Use Jest CLI directly for more control:
```bash
npx jest src/modules/user/tests/unit/user.service.test.ts
npx jest --testNamePattern="should create user successfully"
```

## Test Categories

### Unit Tests
Unit tests focus on testing individual functions or methods in isolation.

**Location**: `src/modules/*/tests/unit/`

**Examples**:
- Service method tests
- Controller method tests
- Utility function tests
- Error handling tests

**Run unit tests**:
```bash
npm test -- --testPathPatterns="unit"
```

### Integration Tests
Integration tests verify that different parts of the application work together correctly.

**Location**: `src/modules/*/tests/integration/`

**Examples**:
- API endpoint tests
- Database integration tests
- Service integration tests

**Run integration tests**:
```bash
npm test -- --testPathPatterns="integration"
```

### E2E Tests
End-to-end tests simulate real user interactions with the application.

**Location**: `src/modules/*/tests/e2e/`

**Examples**:
- Complete user workflows
- API response validation
- Error scenario testing

## Test Configuration

### Jest Configuration
The project uses Jest as the testing framework. Configuration is in `jest.config.ts`:

```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

### Environment Setup
Tests automatically load environment variables from `.env.test` if available.

## Common Test Patterns

### 1. Service Tests
```typescript
describe('UserService', () => {
  it('should return user when found', async () => {
    // Arrange
    const mockUser = { id: '1', email: 'test@example.com' };
    mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

    // Act
    const result = await userService.findById('1');

    // Assert
    expect(result).toEqual(mockUser);
  });
});
```

### 2. Controller Tests
```typescript
describe('UserController', () => {
  it('should return 200 for valid request', async () => {
    // Arrange
    const mockRequest = { params: { id: '1' } };
    const mockResponse = { json: jest.fn(), status: jest.fn() };

    // Act
    await userController.getUserById(mockRequest, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

### 3. Integration Tests
```typescript
describe('Users API', () => {
  it('should return users list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body.data).toBeDefined();
  });
});
```

## Test Utilities

### Mocking
The project uses Jest's built-in mocking capabilities:

```typescript
// Mock a service
jest.mock('../user.service');

// Mock a module
jest.mock('@/modules/shared/logger');

// Mock a function
const mockFn = jest.fn().mockResolvedValue(mockData);
```

### Test Data
Create reusable test data:

```typescript
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  isActive: true,
};
```

## Debugging Tests

### 1. Run Tests in Debug Mode
```bash
npm test -- --testPathPatterns="user.service.test.ts" --verbose
```

### 2. Use Console Logs
```typescript
it('should debug test', () => {
  console.log('Debug information');
  expect(true).toBe(true);
});
```

### 3. Use Jest Debugger
```bash
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPatterns="user.service.test.ts"
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://jestjs.io/docs/best-practices)
- [Mock Functions](https://jestjs.io/docs/mock-functions) 