# Test Database Configuration

This document explains how to set up and use the test database for running tests.

## Overview

The project uses a separate SQLite database for testing to ensure:
- Tests don't interfere with development/production data
- Fast test execution
- Isolated test environment
- No external dependencies

## Test Database Setup

### 1. Test Schema

The test database uses a separate Prisma schema file: `prisma/schema.test.prisma`

Key differences from the main schema:
- Uses SQLite instead of PostgreSQL
- Database file: `test.db` (local file)
- No external database connection required

### 2. Available Scripts

```bash
# Generate Prisma client for test database
npm run test:db:generate

# Create and apply migrations for test database
npm run test:db:migrate

# Seed test database with sample data
npm run test:db:seed

# Reset test database (migrate + seed)
npm run test:db:reset
```

### 3. Test Database Service

The test database is managed by `PrismaTestService`:
- Singleton pattern for connection management
- Automatic cleanup methods
- Isolated from production database

## Usage in Tests

### E2E Tests

E2E tests use the test database through `PrismaTestService`:

```typescript
import { PrismaTestService } from "@/modules/shared/prisma/prisma.test.service";

describe("Users API", () => {
  let prismaService: PrismaTestService;

  beforeAll(async () => {
    prismaService = PrismaTestService.getInstance();
    await prismaService.connect();
    await prismaService.cleanDatabase();
  });

  afterAll(async () => {
    await prismaService.disconnect();
  });
});
```

### Unit Tests

Unit tests can mock the Prisma client or use the test database service.

## Test Data

The test database is seeded with:
- 3 test users (2 active, 1 inactive)
- 2 categories (Technology, Business)
- 2 posts with comments
- 2 tags (javascript, typescript)
- Various relationships between entities

## Database Cleanup

### Automatic Cleanup

Tests automatically clean up data:
- Before each test suite: `cleanDatabase()`
- After individual tests: Delete specific test data

### Manual Cleanup

To reset the test database:

```bash
# Remove test database file
rm test.db

# Recreate and seed
npm run test:db:reset
```

## File Structure

```
prisma/
├── schema.prisma          # Main schema (PostgreSQL)
├── schema.test.prisma     # Test schema (SQLite)
├── seed.ts               # Main seed file
└── seed.test.ts          # Test seed file

src/modules/shared/prisma/
├── prisma.service.ts     # Main Prisma service
└── prisma.test.service.ts # Test Prisma service
```

## Benefits

1. **Isolation**: Tests don't affect development data
2. **Speed**: SQLite is faster than PostgreSQL for tests
3. **Simplicity**: No external database setup required
4. **Reliability**: Tests are deterministic and repeatable
5. **CI/CD Friendly**: Works in any environment

## Troubleshooting

### Migration Issues

If you encounter migration conflicts:

```bash
# Remove existing migrations
rm -rf prisma/migrations

# Recreate migrations
npm run test:db:migrate
```

### Database Lock Issues

If SQLite database is locked:

```bash
# Remove database file
rm test.db

# Recreate
npm run test:db:reset
```

### Schema Changes

When updating the main schema, also update the test schema:

1. Copy changes from `schema.prisma` to `schema.test.prisma`
2. Run `npm run test:db:migrate`
3. Update tests if needed

## Best Practices

1. **Always use test database for tests**
2. **Clean up after each test**
3. **Use descriptive test data**
4. **Keep test schema in sync with main schema**
5. **Don't commit test database files** (already in .gitignore) 