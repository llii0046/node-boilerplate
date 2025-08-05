# Response Utility Guide

This document explains how to use the unified response utility for consistent API responses across the application.

## Overview

The `ResponseUtil` class provides a standardized way to send HTTP responses with consistent structure and status codes. This ensures all API endpoints return responses in a uniform format.

## Quick Start

```typescript
import { ResponseUtil } from "@/shares/response";

// Success response
ResponseUtil.success(res, data);

// Created response
ResponseUtil.created(res, data);

// No content response
ResponseUtil.noContent(res);

// Error responses
ResponseUtil.badRequest(res, "Invalid input");
ResponseUtil.notFound(res, "Resource not found");
ResponseUtil.conflict(res, "Resource conflict");
```

## Response Structure

### Success Response
```json
{
  "data": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Paginated Response
```json
{
  "data": [
    {
      "id": "1",
      "email": "user1@example.com",
      "name": "User 1"
    },
    {
      "id": "2", 
      "email": "user2@example.com",
      "name": "User 2"
    }
  ],
  "meta": {
    "total": 2,
    "currentPage": 1,
    "lastPage": 1,
    "perPage": 10,
    "prev": null,
    "next": null
  }
}
```

### Error Response
```json
{
  "error": "NOT_FOUND",
  "message": "User not found"
}
```

## Available Methods

### Success Responses

#### `success<T>(res: Response, data: T, statusCode?: number)`
Send a success response with data.

```typescript
// Default 200 status
ResponseUtil.success(res, user);

// Custom status code
ResponseUtil.success(res, user, 200);
```

#### `created<T>(res: Response, data: T)`
Send a 201 Created response.

```typescript
ResponseUtil.created(res, newUser);
```

#### `paginated<T>(res: Response, data: T[], meta: any, statusCode?: number)`
Send a paginated response.

```typescript
ResponseUtil.paginated(res, users, {
  total: 100,
  currentPage: 1,
  lastPage: 10,
  perPage: 10,
  prev: null,
  next: "/api/users?page=2"
});
```

#### `noContent(res: Response)`
Send a 204 No Content response.

```typescript
ResponseUtil.noContent(res);
```

### Error Responses

#### `error(res: Response, error: string, message: string, statusCode?: number)`
Send a generic error response.

```typescript
ResponseUtil.error(res, "CUSTOM_ERROR", "Something went wrong", 400);
```

#### `badRequest(res: Response, message: string)`
Send a 400 Bad Request response.

```typescript
ResponseUtil.badRequest(res, "Invalid email format");
```

#### `notFound(res: Response, message: string)`
Send a 404 Not Found response.

```typescript
ResponseUtil.notFound(res, "User not found");
```

#### `conflict(res: Response, message: string)`
Send a 409 Conflict response.

```typescript
ResponseUtil.conflict(res, "Email already exists");
```

#### `validationError(res: Response, message: string, details?: any[])`
Send a 422 Validation Error response.

```typescript
ResponseUtil.validationError(res, "Validation failed", [
  { field: "email", message: "Invalid email format" }
]);
```

#### `internalServerError(res: Response, message?: string)`
Send a 500 Internal Server Error response.

```typescript
ResponseUtil.internalServerError(res);
ResponseUtil.internalServerError(res, "Database connection failed");
```

## Usage in Controllers

### Before (Manual Response)
```typescript
async getUserById(req: Request, res: Response) {
  try {
    const user = await this.userService.findById(id);
    res.status(200).json({ data: user });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        error: error.errorCode,
        message: error.message,
      });
    } else {
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Internal server error",
      });
    }
  }
}
```

### After (Using ResponseUtil)
```typescript
async getUserById(req: Request, res: Response) {
  try {
    const user = await this.userService.findById(id);
    ResponseUtil.success(res, user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      ResponseUtil.notFound(res, error.message);
    } else {
      ResponseUtil.internalServerError(res);
    }
  }
}
```

## Benefits

### 1. Consistency
- All API responses follow the same structure
- Consistent error codes and messages
- Uniform status codes

### 2. Maintainability
- Centralized response logic
- Easy to modify response format
- Reduced code duplication

### 3. Type Safety
- TypeScript support for response data
- Compile-time checking of response structure

### 4. Developer Experience
- Clear and intuitive API
- Self-documenting method names
- Reduced boilerplate code

## Best Practices

### 1. Always Use ResponseUtil
Instead of manually setting status codes and JSON responses, use the appropriate ResponseUtil method.

### 2. Handle Errors Properly
```typescript
try {
  const result = await service.method();
  ResponseUtil.success(res, result);
} catch (error) {
  if (error instanceof NotFoundError) {
    ResponseUtil.notFound(res, error.message);
  } else if (error instanceof ValidationError) {
    ResponseUtil.validationError(res, error.message, error.details);
  } else {
    ResponseUtil.internalServerError(res);
  }
}
```

### 3. Use Appropriate Status Codes
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Internal Server Error

### 4. Provide Meaningful Messages
```typescript
// Good
ResponseUtil.badRequest(res, "Email is required");

// Bad
ResponseUtil.badRequest(res, "Error");
```

## Migration Guide

To migrate existing controllers to use ResponseUtil:

1. **Import ResponseUtil**
   ```typescript
   import { ResponseUtil } from "@/shares/response";
   ```

2. **Replace manual responses**
   ```typescript
   // Before
   res.status(200).json({ data: result });
   
   // After
   ResponseUtil.success(res, result);
   ```

3. **Update error handling**
   ```typescript
   // Before
   res.status(404).json({ error: "NOT_FOUND", message: "Not found" });
   
   // After
   ResponseUtil.notFound(res, "Not found");
   ```

## Testing

When testing controllers that use ResponseUtil, ensure your tests expect the correct response structure:

```typescript
it("should return user data", async () => {
  const mockUser = { id: "1", name: "John" };
  
  await controller.getUser(req, res);
  
  expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
  expect(mockResponse.status).toHaveBeenCalledWith(200);
});
```

## Additional Resources

- [Express.js Response Documentation](https://expressjs.com/en/api.html#res)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Best Practices](https://restfulapi.net/) 