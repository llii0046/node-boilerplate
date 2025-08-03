import { LoggerService } from "./logger/logger.service.js";
import { PrismaService } from "./prisma/prisma.service.js";
import { SwaggerService } from "./swagger/swagger.service.js";
import { SwaggerConfig } from "./swagger/swagger-config.js";

/**
 * Global shared module
 * Manages all public services and dependencies
 */
export class SharedModule {
  private loggerService: LoggerService;
  private prismaService: PrismaService;
  private swaggerService: SwaggerService;

  constructor() {
    // Initialize public services
    this.loggerService = new LoggerService();
    this.prismaService = new PrismaService();

    const swaggerConfig: SwaggerConfig = {
      title: "User Management API",
      version: "0.1.0",
      description: "User Management API Documentation",
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development Environment",
        },
      ],
      basePath: "/api",
    };

    this.swaggerService = new SwaggerService(swaggerConfig);
  }

  /**
   * Get logger service
   */
  getLoggerService(): LoggerService {
    return this.loggerService;
  }

  /**
   * Get Prisma service
   */
  getPrismaService(): PrismaService {
    return this.prismaService;
  }

  /**
   * Get Swagger service
   */
  getSwaggerService(): SwaggerService {
    return this.swaggerService;
  }

  /**
   * Module initialization
   */
  async onModuleInit(): Promise<void> {
    await this.prismaService.connect();
    this.loggerService.info("SharesModule initialized successfully");
  }

  /**
   * Module destruction
   */
  async onModuleDestroy(): Promise<void> {
    await this.prismaService.disconnect();
    this.loggerService.info("SharesModule destroyed successfully");
  }
}
