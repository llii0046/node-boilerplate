import { Router } from "express";
import { getRouteMetadata } from "./decorators/route.decorator";
import { SwaggerGenerator } from "./swagger-generator";

export interface RouteMetadata {
  path: string;
  method: string;
  middlewares?: any[];
}

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
          const handler = prototype[methodName].bind(this);
          
          // Apply middlewares if any
          if (routeMetadata.middlewares && routeMetadata.middlewares.length > 0) {
            routerMethod.call(this.router, routeMetadata.path, ...routeMetadata.middlewares, handler);
          } else {
            routerMethod.call(this.router, routeMetadata.path, handler);
          }
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
