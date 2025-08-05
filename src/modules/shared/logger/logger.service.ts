import pino from "pino";
import { ILoggerService } from "./logger.interface";
import { LoggerConfig, LogContext, ErrorLogData, OperationLogData } from "./logger.type";

export class LoggerService implements ILoggerService {
  private logger: pino.Logger;

  constructor(config: LoggerConfig = {}) {
    const {
      level = process.env.LOG_LEVEL || "info",
      outputToFile = process.env.LOG_OUTPUT_FILE === "true",
      logFilePath = process.env.LOG_FILE_PATH || "./logs/app.log",
      prettyPrint = process.env.NODE_ENV === "development",
    } = config;

    // Build transport configuration
    let transport: any = undefined;

    if (outputToFile) {
      // Output to file
      transport = {
        target: "pino/file",
        options: {
          destination: logFilePath,
          mkdir: true,
        },
      };
    } else if (prettyPrint) {
      // Pretty output to console
      transport = {
        target: "pino-pretty",
        options: { colorize: true },
      };
    }

    this.logger = pino({
      level,
      transport,
      base: {
        pid: process.pid,
        hostname: process.env.HOSTNAME || "unknown",
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  /**
   * Log error
   */
  error(data: ErrorLogData): void {
    const { error, context = {}, additionalInfo = {} } = data;

    this.logger.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      ...additionalInfo,
    });
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.logger.warn({
      message,
      ...context,
      ...data,
    });
  }

  /**
   * Log info
   */
  info(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.logger.info({
      message,
      ...context,
      ...data,
    });
  }

  /**
   * Log debug
   */
  debug(message: string, context?: LogContext, data?: Record<string, any>): void {
    this.logger.debug({
      message,
      ...context,
      ...data,
    });
  }

  /**
   * Log operation
   */
  operation(data: OperationLogData): void {
    const { operation, status, duration, context = {}, data: operationData } = data;

    this.logger.info({
      message: `Operation ${operation} ${status}`,
      operation,
      status,
      duration,
      ...context,
      ...operationData,
    });
  }

  /**
   * Log database operation
   */
  db(operation: string, table: string, duration: number, context?: LogContext): void {
    this.logger.info({
      message: `Database operation: ${operation} on ${table}`,
      operation,
      table,
      duration,
      type: "database",
      ...context,
    });
  }

  /**
   * Log HTTP request
   */
  http(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ): void {
    this.logger.info({
      message: `${method} ${url} - ${statusCode}`,
      method,
      url,
      statusCode,
      duration,
      type: "http",
      ...context,
    });
  }

  /**
   * Create child logger (for specific modules)
   */
  child(context: LogContext): ILoggerService {
    const childLogger = new LoggerService();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}
