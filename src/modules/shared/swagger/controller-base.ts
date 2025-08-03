import { Router } from "express";
import { getRouteMetadata } from "./decorators/route.decorator.js";
import { SwaggerGenerator } from "./swagger-generator.js";

export abstract class ControllerBase {
  protected router: Router;
  protected swaggerGenerator: SwaggerGenerator;

  constructor() {
    this.router = Router();
    this.swaggerGenerator = new SwaggerGenerator();
    this.setupRoutes();
  }

  protected setupRoutes(): void {
    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== "constructor" && typeof prototype[name] === "function",
    );

    methodNames.forEach((methodName) => {
      const routeMetadata = getRouteMetadata(prototype, methodName);
      if (routeMetadata) {
        const method = routeMetadata.method.toLowerCase();

        // Register route - use path defined in decorator
        const routerMethod = this.router[method as keyof Router] as any;
        if (routerMethod && typeof routerMethod === "function") {
          routerMethod.call(this.router, routeMetadata.path, prototype[methodName].bind(this));
        }

        // Add to Swagger generator - use original path
        this.swaggerGenerator.addRoute(
          routeMetadata.path,
          method,
          prototype[methodName],
          this,
          this.constructor,
        );
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }

  public getSwaggerGenerator(): SwaggerGenerator {
    return this.swaggerGenerator;
  }
}
