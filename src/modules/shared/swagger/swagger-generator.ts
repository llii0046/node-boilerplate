import { getApiProperties } from "./decorators/api-property.decorator.js";
import { getApiResponses } from "./decorators/api-response.decorator.js";
import { getApiOperation } from "./decorators/api-operation.decorator.js";
import { getApiTags } from "./decorators/api-tags.decorator.js";
import { getApiParams } from "./decorators/api-param.decorator.js";
import { getApiQueries } from "./decorators/api-query.decorator.js";
import { getApiBody } from "./decorators/api-body.decorator.js";

export interface RouteInfo {
  path: string;
  method: string;
  handler: any;
  controller: any;
  controllerClass: any;
}

export class SwaggerGenerator {
  private routes: RouteInfo[] = [];

  constructor() {}

  public addRoute(
    path: string,
    method: string,
    handler: any,
    controller: any,
    controllerClass?: any,
  ): void {
    this.routes.push({
      path,
      method,
      handler,
      controller,
      controllerClass: controllerClass || controller.constructor,
    });
  }

  public getRoutes(): RouteInfo[] {
    return this.routes;
  }

  public generateOperations(): Record<string, any> {
    const operations: Record<string, any> = {};

    this.routes.forEach((route) => {
      const operation = this.generateOperation(route);
      if (operation) {
        const key = `${route.method.toLowerCase()}:${route.path}`;
        operations[key] = operation;
      }
    });

    return operations;
  }

  public generateSchemas(): Record<string, any> {
    const schemas: Record<string, any> = {};
    const dtoClasses = new Set<any>();

    this.routes.forEach((route) => {
      // Collect DTO classes from responses
      const responses = getApiResponses(route.controller, route.handler.name);
      Object.values(responses).forEach((response: any) => {
        if (response.content?.["application/json"]?.schema) {
          this.collectDtoClasses(response.content["application/json"].schema, dtoClasses);
        }
      });

      // Collect DTO classes from request body
      const body = getApiBody(route.controller, route.handler.name);
      if (body && body.content?.["application/json"]?.schema) {
        this.collectDtoClasses(body.content["application/json"].schema, dtoClasses);
      }
    });

    // Generate schema for each DTO class
    dtoClasses.forEach((dtoClass) => {
      const className = dtoClass.name;
      const properties = getApiProperties(dtoClass);

      if (Object.keys(properties).length > 0) {
        schemas[className] = {
          type: "object",
          properties,
          required: Object.keys(properties).filter((key) => properties[key].required),
        };
      }
    });
    return schemas;
  }

  private generateOperation(route: RouteInfo): any {
    const { handler, controller, controllerClass } = route;

    // Get operation metadata
    const operation = getApiOperation(controller, handler.name);
    const responses = getApiResponses(controller, handler.name);
    const tags = getApiTags(controllerClass);
    const params = getApiParams(controller, handler.name);
    const queries = getApiQueries(controller, handler.name);
    const body = getApiBody(controller, handler.name);

    const operationSpec: any = {
      ...operation,
      responses: {},
    };

    // Add tags
    if (tags && tags.length > 0) {
      operationSpec.tags = tags;
    }

    // Add parameters
    const parameters: any[] = [];

    if (params && params.length > 0) {
      parameters.push(...params);
    }

    if (queries && queries.length > 0) {
      parameters.push(...queries);
    }

    if (parameters.length > 0) {
      operationSpec.parameters = parameters;
    }

    // Add request body
    if (body && Object.keys(body).length > 0) {
      operationSpec.requestBody = body;
    }

    // Add responses
    Object.keys(responses).forEach((statusCode) => {
      operationSpec.responses[statusCode] = responses[statusCode];
    });

    // If no responses, add default response
    if (Object.keys(operationSpec.responses).length === 0) {
      operationSpec.responses["200"] = {
        description: "Success",
        content: {
          "application/json": {
            schema: { type: "object" },
          },
        },
      };
    }

    // Remove undefined values, but keep tags
    Object.keys(operationSpec).forEach((key) => {
      if (operationSpec[key] === undefined && key !== "tags") {
        delete operationSpec[key];
      }
    });

    return operationSpec;
  }

  private collectDtoClasses(schema: any, dtoClasses: Set<any>): void {
    // Handle $ref references
    if (schema.$ref) {
      const className = schema.$ref.split("/").pop();
      return;
    }

    // Handle new format: { type: Class }
    if (schema.type && typeof schema.type === "function") {
      dtoClasses.add(schema.type);
      return;
    }

    if (schema.type === "array" && schema.items) {
      this.collectDtoClasses(schema.items, dtoClasses);
    } else if (schema.type === "object" && schema.properties) {
      Object.values(schema.properties).forEach((prop: any) => {
        if (prop.type === "array" && prop.items) {
          this.collectDtoClasses(prop.items, dtoClasses);
        } else if (typeof prop.type === "function") {
          dtoClasses.add(prop.type);
        }
      });
    } else if (typeof schema.type === "function") {
      dtoClasses.add(schema.type);
    }
  }
}
