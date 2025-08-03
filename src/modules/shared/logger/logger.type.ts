// Log level enumeration
export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

// Log context interface
export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  module?: string;
  method?: string;
  [key: string]: any;
}

// Error log interface
export interface ErrorLogData {
  error: Error;
  context?: LogContext;
  additionalInfo?: Record<string, any>;
}

// Operation log interface
export interface OperationLogData {
  operation: string;
  status: "success" | "failed";
  duration?: number;
  context?: LogContext;
  data?: Record<string, any>;
}

// Logger configuration interface
export interface LoggerConfig {
  level?: string;
  outputToFile?: boolean;
  logFilePath?: string;
  prettyPrint?: boolean;
}
