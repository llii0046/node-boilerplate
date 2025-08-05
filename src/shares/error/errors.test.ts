import {
  AppError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from "../error/errors";

describe("Custom Error Classes", () => {
  describe("AppError", () => {
    it("should create base error with default values", () => {
      class TestError extends AppError {
        constructor(message: string) {
          super(message);
        }
      }

      const error = new TestError("Test message");
      expect(error.message).toBe("Test message");
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe("INTERNAL_ERROR");
      expect(error.isOperational).toBe(true);
    });

    it("should create error with custom values", () => {
      class TestError extends AppError {
        constructor(message: string) {
          super(message, 400, "CUSTOM_ERROR", false);
        }
      }

      const error = new TestError("Custom message");
      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe("CUSTOM_ERROR");
      expect(error.isOperational).toBe(false);
    });
  });

  describe("NotFoundError", () => {
    it("should create 404 error", () => {
      const error = new NotFoundError("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe("NOT_FOUND");
      expect(error.message).toBe("User not found");
    });

    it("should create 404 error with custom error code", () => {
      const error = new NotFoundError("User not found", "USER_NOT_FOUND");
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe("USER_NOT_FOUND");
    });
  });

  describe("BadRequestError", () => {
    it("should create 400 error", () => {
      const error = new BadRequestError("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe("BAD_REQUEST");
    });
  });

  describe("ConflictError", () => {
    it("should create 409 error", () => {
      const error = new ConflictError("Email already exists");
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe("CONFLICT");
    });
  });

  describe("ValidationError", () => {
    it("should create 422 error with details", () => {
      const details = [{ field: "email", message: "Invalid email format" }];
      const error = new ValidationError("Validation failed", details);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual(details);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create 401 error", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe("UNAUTHORIZED");
    });
  });

  describe("ForbiddenError", () => {
    it("should create 403 error", () => {
      const error = new ForbiddenError("Insufficient permissions");
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe("FORBIDDEN");
    });
  });

  describe("InternalServerError", () => {
    it("should create 500 error", () => {
      const error = new InternalServerError("Database connection failed");
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe("INTERNAL_ERROR");
      expect(error.isOperational).toBe(false);
    });
  });

  describe("Error inheritance", () => {
    it("should be instance of Error", () => {
      const notFoundError = new NotFoundError("Not found");
      const conflictError = new ConflictError("Conflict");

      expect(notFoundError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(AppError);
      expect(conflictError).toBeInstanceOf(Error);
      expect(conflictError).toBeInstanceOf(AppError);
    });
  });
});
