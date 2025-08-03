# Logging Module Usage Guide

This project uses Pino as the logging library, providing structured logging functionality.

## Features

- ✅ Structured logging
- ✅ Multiple log levels (fatal, error, warn, info, debug, trace)
- ✅ Request tracing (Request ID)
- ✅ Performance monitoring
- ✅ Error stack trace recording
- ✅ Pretty output for development environment
- ✅ JSON format for production environment

## Quick Start

### 1. Basic Usage

```typescript
import { loggerService } from "@/shares/logger";

// Log info message
loggerService.info("User login successful", {
  userId: "123",
  email: "user@example.com",
});

// Log error message
try {
  // Your code
} catch (error) {
  loggerService.error({
    error: error as Error,
    context: { operation: "userLogin" },
    additionalInfo: { userId: "123" },
  });
}
```

### 2. Using in Service Layer

```typescript
import { loggerService } from "@/shares/logger";

export class UserService {
  private logger = loggerService.child({ module: "UserService" });

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const startTime = Date.now();
    const operation = "createUser";

    try {
      this.logger.info(`Starting user creation`, { email: data.email });

      // Business logic
      const user = await prismaService.user.create({ data });

      const duration = Date.now() - startTime;

      this.logger.operation({
        operation,
        status: "success",
        duration,
        data: { userId: user.id, email: user.email },
      });

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        error: error as Error,
        context: { operation, email: data.email },
        additionalInfo: { duration },
      });

      throw error;
    }
  }
}
```

## API Reference

### LoggerService Methods

#### `info(message: string, context?: LogContext, data?: Record<string, any>)`

Log info level message.

#### `warn(message: string, context?: LogContext, data?: Record<string, any>)`

Log warning level message.

#### `debug(message: string, context?: LogContext, data?: Record<string, any>)`

Log debug level message.

#### `error(data: ErrorLogData)`

```typescript
interface ErrorLogData {
  error: Error;
  context?: LogContext;
  additionalInfo?: Record<string, any>;
}
```

#### `operation(data: OperationLogData)`

```typescript
interface OperationLogData {
  operation: string;
  status: "success" | "failed";
  duration?: number;
  context?: LogContext;
  data?: Record<string, any>;
}
```

#### `db(operation: string, table: string, duration: number, context?: LogContext)`

Log database operation message.

#### `http(method: string, url: string, statusCode: number, duration: number, context?: LogContext)`

Log HTTP request message.

#### `child(context: LogContext): LoggerService`

Create a child logger for specific modules or requests.

## Log Context

```typescript
interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  module?: string;
  method?: string;
  [key: string]: any;
}
```

## Log Output Location

### Current Configuration

Based on your project configuration, logs will be output to the following locations:

#### **Local Development Environment (when Swagger is tested)**

- **Output Location**: Console (terminal)
- **Format**: Pretty output (colored, structured)
- **Position**: Your terminal window where you start the server

#### **Production Environment**

- **Output Location**: Console (terminal)
- **Format**: JSON format
- **Position**: Server console

### Configure logs to be output to a file

If you want logs to be output to a file, you can configure it via environment variables:

```bash
# .env
LOG_OUTPUT_FILE=true
LOG_FILE_PATH=./logs/app.log
```

## Environment Configuration

### Environment Variables

| Variable Name       | Default Value    | Description    |
| ------------------- | ---------------- | -------------- |
| `LOG_LEVEL`         | `info`           | Log Level      |
| `NODE_ENV`          | `development`    | Environment Mode |
| `LOG_PRETTY`        | `undefined`      | Whether to pretty output |
| `LOG_OUTPUT_FILE`   | `false`          | Whether to output to file |
| `LOG_FILE_PATH`     | `./logs/app.log` | Log file path  |

### Development Environment

```bash
# .env
LOG_LEVEL=debug
NODE_ENV=development
LOG_PRETTY=true
LOG_OUTPUT_FILE=false
```

### Production Environment

```bash
# .env
LOG_LEVEL=info
NODE_ENV=production
LOG_PRETTY=false
LOG_OUTPUT_FILE=true
LOG_FILE_PATH=./logs/production.log
```

### Test Environment

```bash
# .env
LOG_LEVEL=error
NODE_ENV=test
LOG_PRETTY=false
LOG_OUTPUT_FILE=false
```

## Log Output Examples

### Development Environment (Pretty Output)

```
[12:34:56.789] INFO  (UserService/12345) User login successful
    userId: "123"
    email: "user@example.com"
    loginTime: "2024-01-15T12:34:56.789Z"
```

### Production Environment (JSON Format)

```json
{
  "level": 30,
  "time": 1705312496789,
  "pid": 12345,
  "hostname": "server-01",
  "module": "UserService",
  "requestId": "req-12345",
  "msg": "User login successful",
  "userId": "123",
  "email": "user@example.com",
  "loginTime": "2024-01-15T12:34:56.789Z"
}
```

## Best Practices

### 1. Use Child Loggers

```typescript
// Create child loggers for each module
private logger = loggerService.child({ module: "UserService" });

// Create child loggers for each request
const requestLogger = loggerService.child({ requestId: "req-123" });
```

### 2. Record Operation Performance

```typescript
const startTime = Date.now();
try {
  // Execute operation
  const result = await someOperation();

  const duration = Date.now() - startTime;
  this.logger.operation({
    operation: "someOperation",
    status: "success",
    duration,
    data: { resultId: result.id },
  });
} catch (error) {
  const duration = Date.now() - startTime;
  this.logger.error({
    error: error as Error,
    context: { operation: "someOperation" },
    additionalInfo: { duration },
  });
}
```

### 3. Record Business Critical Information

```typescript
// Record user operation
this.logger.info("User updated personal information", {
  userId: user.id,
  updatedFields: ["name", "email"],
  previousEmail: oldEmail,
});

// Record system event
this.logger.warn("Database connection pool approaching limit", {
  currentConnections: 95,
  maxConnections: 100,
  poolName: "main",
});
```

### 4. Error Logs Include Context

```typescript
this.logger.error({
  error: error as Error,
  context: {
    operation: "createUser",
    userId: "123",
    module: "UserService",
  },
  additionalInfo: {
    inputData: { email: "user@example.com" },
    validationErrors: errors,
  },
});
```

## Middleware Integration

The project has integrated an automatic HTTP request logging middleware:

- Automatically generate request ID
- Record request start and end
- Record response status code and duration
- Record error information
