import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pino from "pino";
import pinoHttp from "pino-http";
import { AppError, ValidationError } from "@/shares/error";

dotenv.config();

// Configure log output
const logConfig = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: undefined as any,
};

// Configure log output based on environment
if (process.env.LOG_OUTPUT_FILE === "true") {
  // Output to file
  logConfig.transport = {
    target: "pino/file",
    options: {
      destination: process.env.LOG_FILE_PATH || "./logs/app.log",
      mkdir: true,
    },
  };
} else if (process.env.LOG_PRETTY === "true" || process.env.NODE_ENV === "development") {
  // Pretty output to console
  logConfig.transport = { target: "pino-pretty", options: { colorize: true } };
}

const logger = pino(logConfig);

export const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Use pino-http for request logging
app.use(
  pinoHttp({
    logger,
    // Custom request log format
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
      if (res.statusCode >= 500 || err) return "error";
      return "info";
    },
    // Custom request ID
    genReqId: (req) => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
  }),
);

// Global error handler
app.use(
  (
    err: Error & { name?: string; code?: string; errors?: unknown[] },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    // Log error
    logger.error({
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    // Handle custom AppError
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.errorCode,
        message: err.message,
        ...(err instanceof ValidationError && { details: err.details }),
      });
    }

    // Handle validation errors
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Data validation failed",
        details: err.errors,
      });
    }

    // Handle Prisma errors
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "CONFLICT",
        message: "Data already exists",
      });
    }

    // Default error
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  },
);
