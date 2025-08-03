import { Router } from "express";
import { UserModule } from "./modules/user/user.module.js";
import { HealthController } from "./modules/health/health.controller.js";
import swaggerUi from "swagger-ui-express";
import { SharedModule } from "@/modules/shared/shared.module";
import { SwaggerService } from "@/modules/shared/swagger/swagger.service";

export class AppModule {
  private router: Router;
  private userModule: UserModule;
  private healthController: HealthController;
  private sharedModule: SharedModule;

  constructor() {
    this.router = Router();

    // Initialize shared module
    this.sharedModule = new SharedModule();

    // Create modules and inject dependencies
    this.userModule = new UserModule(
      this.sharedModule.getPrismaService(),
      this.sharedModule.getLoggerService(),
    );
    this.healthController = new HealthController();

    this.setupRoutes();
    this.setupSwagger();

    console.log("AppModule constructor completed");
    console.log("Router stack:", this.router.stack.length);
  }

  // Register module routes
  private setupRoutes(): void {
    this.router.use("/users", this.userModule.getRouter());
    this.router.use("/health", this.healthController.getRouter());
    console.log("Routes setup completed");
    console.log("User module router stack:", this.userModule.getRouter().stack.length);
    console.log("Health controller router stack:", this.healthController.getRouter().stack.length);
  }

  private setupSwagger(): void {
    try {
      const swaggerService = this.sharedModule.getSwaggerService();

      // Add user module's Swagger generator
      const userController = this.userModule.getUserController();
      if (userController) {
        swaggerService.addGenerator(userController.getSwaggerGenerator());
      }

      // Add health check's Swagger generator
      swaggerService.addGenerator(this.healthController.getSwaggerGenerator());

      // Generate Swagger specification
      const spec = swaggerService.generateSpec();
      console.log("Generated Swagger spec:", JSON.stringify(spec, null, 2));

      // Set up Swagger UI routes
      this.router.use("/docs", swaggerUi.serve);
      this.router.get(
        "/docs",
        swaggerUi.setup(spec, {
          swaggerOptions: {
            docExpansion: "list",
            filter: true,
            showRequestHeaders: true,
            tryItOutEnabled: true,
          },
        }),
      );
      this.router.get(
        "/docs/",
        swaggerUi.setup(spec, {
          swaggerOptions: {
            docExpansion: "list",
            filter: true,
            showRequestHeaders: true,
            tryItOutEnabled: true,
          },
        }),
      );
      this.router.get("/openapi.json", (_req, res) => res.json(spec));

      console.log("Swagger routes registered successfully");
      console.log("Router stack after Swagger setup:", this.router.stack.length);
      console.log(
        "Router stack details:",
        this.router.stack.map((layer: any) => ({
          regexp: layer.regexp.toString(),
          route: layer.route?.path,
          methods: layer.route?.methods,
        })),
      );
    } catch (error) {
      console.error("Error setting up Swagger:", error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  public async onModuleInit(): Promise<void> {
    // Initialize shared module
    await this.sharedModule.onModuleInit();
  }

  public getSwaggerService(): SwaggerService {
    return this.sharedModule.getSwaggerService();
  }

  public async onModuleDestroy(): Promise<void> {
    // Destroy shared module
    await this.sharedModule.onModuleDestroy();
  }
}
