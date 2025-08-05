import { Response } from "express";

export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    total?: number;
    currentPage?: number;
    lastPage?: number;
    perPage?: number;
    prev?: string | null;
    next?: string | null;
  };
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    prev: string | null;
    next: string | null;
  };
}

export class ResponseUtil {
  /**
   * Send success response with data
   */
  static success<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json({ data });
  }

  /**
   * Send success response with paginated data
   */
  static paginated<T>(res: Response, data: T[], meta: any, statusCode: number = 200): void {
    res.status(statusCode).json({ data, meta });
  }

  /**
   * Send created response
   */
  static created<T>(res: Response, data: T): void {
    res.status(201).json({ data });
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(res: Response, error: string, message: string, statusCode: number = 400): void {
    res.status(statusCode).json({ error, message });
  }

  /**
   * Send bad request error
   */
  static badRequest(res: Response, message: string): void {
    this.error(res, "BAD_REQUEST", message, 400);
  }

  /**
   * Send not found error
   */
  static notFound(res: Response, message: string): void {
    this.error(res, "NOT_FOUND", message, 404);
  }

  /**
   * Send conflict error
   */
  static conflict(res: Response, message: string): void {
    this.error(res, "CONFLICT", message, 409);
  }

  /**
   * Send validation error
   */
  static validationError(res: Response, message: string, details?: any[]): void {
    res.status(422).json({ 
      error: "VALIDATION_ERROR", 
      message,
      details 
    });
  }

  /**
   * Send internal server error
   */
  static internalServerError(res: Response, message: string = "Internal server error"): void {
    this.error(res, "INTERNAL_ERROR", message, 500);
  }
} 