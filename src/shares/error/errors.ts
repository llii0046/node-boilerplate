// Base error class
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Ensure error stack trace is correct
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", errorCode: string = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", errorCode: string = "BAD_REQUEST") {
    super(message, 400, errorCode);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", errorCode: string = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

// 422 Validation
export class ValidationError extends AppError {
  public readonly details?: unknown[];

  constructor(
    message: string = "Validation failed",
    details?: unknown[],
    errorCode: string = "VALIDATION_ERROR",
  ) {
    super(message, 422, errorCode);
    this.details = details;
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", errorCode: string = "UNAUTHORIZED") {
    super(message, 401, errorCode);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", errorCode: string = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

// 500 Internal Server
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", errorCode: string = "INTERNAL_ERROR") {
    super(message, 500, errorCode, false); // Non-operational error
  }
}
