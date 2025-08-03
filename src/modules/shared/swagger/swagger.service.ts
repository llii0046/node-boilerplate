import { SwaggerGenerator } from "./swagger-generator";
import { SwaggerConfigManager, SwaggerConfig } from "./swagger-config";

export interface RouteMapping {
  controllerName: string;
  modulePath: string;
  swaggerPath: string;
}

export class SwaggerService {
  private generators: SwaggerGenerator[] = [];
  private configManager: SwaggerConfigManager;
  private routeMappings: RouteMapping[] = [];

  constructor(config: SwaggerConfig = {}) {
    this.configManager = new SwaggerConfigManager(config);

    // Define route mapping rules
    this.routeMappings = [
      { controllerName: "HealthController", modulePath: "/health", swaggerPath: "/api/health" },
      { controllerName: "UserController", modulePath: "/users", swaggerPath: "/api/users" },
    ];
  }

  public addGenerator(generator: SwaggerGenerator): void {
    this.generators.push(generator);
  }

  public getGenerators(): SwaggerGenerator[] {
    return this.generators;
  }

  public updateConfig(newConfig: Partial<SwaggerConfig>): void {
    this.configManager.updateConfig(newConfig);
  }

  public generateSpec(): any {
    const spec = this.configManager.createBaseSpec();
    const allTags = new Set<string>();

    // Merge paths and operations from all generators
    this.generators.forEach((generator) => {
      const routes = generator.getRoutes();
      const operations = generator.generateOperations();

      routes.forEach((route) => {
        const method = route.method.toLowerCase();
        const operationKey = `${method}:${route.path}`;
        const operation = operations[operationKey];

        if (operation) {
          // Determine correct Swagger path based on controller name
          const mapping = this.routeMappings.find(
            (m) => route.controller.constructor.name === m.controllerName,
          );

          let swaggerPath = "/api";
          if (mapping) {
            swaggerPath = mapping.swaggerPath;
          }

          // Handle sub-paths, ensure path parameter format is correct
          if (route.path !== "/") {
            // Convert Express-style path parameters :param to OpenAPI-style {param}
            const openApiPath = route.path.replace(/:([^/]+)/g, "{$1}");
            swaggerPath += openApiPath;
          }

          if (!spec.paths[swaggerPath]) {
            spec.paths[swaggerPath] = {};
          }

          spec.paths[swaggerPath][method] = operation;

          // Collect tags
          if (operation.tags && Array.isArray(operation.tags)) {
            operation.tags.forEach((tag: string) => allTags.add(tag));
          }
        }
      });
    });

    // Generate tags array
    spec.tags = Array.from(allTags).map((tag) => ({ name: tag }));

    // Merge all schemas
    this.generators.forEach((generator) => {
      const schemas = generator.generateSchemas();
      Object.assign(spec.components.schemas, schemas);
    });

    // Process schema references
    this.processSchemaReferences(spec);

    return spec;
  }

  public getSpecAsJson(): string {
    return JSON.stringify(this.generateSpec(), null, 2);
  }

  private processSchemaReferences(spec: any): void {
    // Process schema references in all operations
    Object.values(spec.paths).forEach((path: any) => {
      Object.values(path).forEach((operation: any) => {
        // Process schema references in request body
        if (
          operation.requestBody?.content?.["application/json"]?.schema?.type &&
          typeof operation.requestBody.content["application/json"].schema.type === "function"
        ) {
          const dtoClass = operation.requestBody.content["application/json"].schema.type;
          operation.requestBody.content["application/json"].schema = {
            $ref: `#/components/schemas/${dtoClass.name}`,
          };
        }

        // Process schema references in response
        Object.values(operation.responses || {}).forEach((response: any) => {
          if (
            response.content?.["application/json"]?.schema?.type &&
            typeof response.content["application/json"].schema.type === "function"
          ) {
            const dtoClass = response.content["application/json"].schema.type;
            response.content["application/json"].schema = {
              $ref: `#/components/schemas/${dtoClass.name}`,
            };
          }
        });
      });
    });
  }
}
