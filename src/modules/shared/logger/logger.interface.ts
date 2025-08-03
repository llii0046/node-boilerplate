import { LogContext, ErrorLogData, OperationLogData } from "./logger.type.js";

// Logger service interface
export interface ILoggerService {
  error(data: ErrorLogData): void;
  warn(message: string, context?: LogContext, data?: Record<string, any>): void;
  info(message: string, context?: LogContext, data?: Record<string, any>): void;
  debug(message: string, context?: LogContext, data?: Record<string, any>): void;
  operation(data: OperationLogData): void;
  db(operation: string, table: string, duration: number, context?: LogContext): void;
  http(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ): void;
  child(context: LogContext): ILoggerService;
}
