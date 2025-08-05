import { LoggerService } from "./logger/logger.service";
import { PrismaTestService } from "./prisma/prisma.test.service";
import { SwaggerService } from "./swagger/swagger.service";
import { SwaggerConfig } from "./swagger/swagger-config";

/**
 * Test shared module
 * Uses SQLite database for testing
 */
export class SharedTestModule {
  private loggerService: LoggerService;
  private prismaService: PrismaTestService;
  private swaggerService: SwaggerService;

  constructor() {
    // Initialize public services
    this.loggerService = new LoggerService();
    this.prismaService = PrismaTestService.getInstance();

    const swaggerConfig: SwaggerConfig = {
      title: "User Management API (Test)",
      version: "0.1.0",
      description: "User Management API Documentation - Test Environment",
      servers: [
        {
          url: "http://localhost:3000",
          description: "Test Environment",
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
   * Get Prisma test service
   */
  getPrismaService(): PrismaTestService {
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
    this.loggerService.info("SharedTestModule initialized successfully");
  }

  /**
   * Module destruction
   */
  async onModuleDestroy(): Promise<void> {
    await this.prismaService.disconnect();
    this.loggerService.info("SharedTestModule destroyed successfully");
  }
} 