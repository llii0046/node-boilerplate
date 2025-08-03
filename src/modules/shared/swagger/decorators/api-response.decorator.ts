import "reflect-metadata";

export interface ApiResponseOptions {
  status: number;
  description?: string;
  type?: any;
  isArray?: boolean;
  example?: any;
  headers?: Record<string, any>;
}

const API_RESPONSE_METADATA_KEY = "swagger:api-response";

export function ApiResponse(options: ApiResponseOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const existingResponses =
      Reflect.getMetadata(API_RESPONSE_METADATA_KEY, target, propertyKey) || {};

    const responseSchema: any = {
      description: options.description,
      content: {
        "application/json": {
          schema: options.type ? generateSchemaFromType(options.type, options.isArray) : undefined,
          example: options.example,
        },
      },
      headers: options.headers,
    };

    // Remove undefined values
    if (!responseSchema.content["application/json"].schema) {
      delete responseSchema.content["application/json"].schema;
    }
    if (!responseSchema.content["application/json"].example) {
      delete responseSchema.content["application/json"].example;
    }
    if (!responseSchema.headers) {
      delete responseSchema.headers;
    }

    existingResponses[options.status] = responseSchema;
    Reflect.defineMetadata(API_RESPONSE_METADATA_KEY, existingResponses, target, propertyKey);
  };
}

// Predefined response decorators
export function ApiOkResponse(options: Omit<ApiResponseOptions, "status"> = {}): MethodDecorator {
  return ApiResponse({ ...options, status: 200 });
}

export function ApiCreatedResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({ ...options, status: 201 });
}

export function ApiBadRequestResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 400,
    description: options.description || "Bad Request",
  });
}

export function ApiUnauthorizedResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 401,
    description: options.description || "Unauthorized",
  });
}

export function ApiNotFoundResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 404,
    description: options.description || "Not Found",
  });
}

export function ApiConflictResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 409,
    description: options.description || "Conflict",
  });
}

export function ApiServiceUnavailableResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 503,
    description: options.description || "Service Unavailable",
  });
}

export function ApiInternalServerErrorResponse(
  options: Omit<ApiResponseOptions, "status"> = {},
): MethodDecorator {
  return ApiResponse({
    ...options,
    status: 500,
    description: options.description || "Internal Server Error",
  });
}

function generateSchemaFromType(type: any, isArray: boolean = false): any {
  if (isArray) {
    return {
      type: "array",
      items: generateSchemaFromType(type),
    };
  }

  // If it's a basic type
  if (typeof type === "string") {
    return { type };
  }

  // If it's a class, try to get properties from decorators
  if (typeof type === "function") {
    const properties = getApiProperties(type);
    if (Object.keys(properties).length > 0) {
      return {
        type: "object",
        properties,
        required: Object.keys(properties).filter((key) => properties[key].required),
      };
    }
  }

  // Default return object
  return { type: "object" };
}

// Import from api-property.decorator.ts
function getApiProperties(target: any): Record<string, any> {
  const API_PROPERTY_METADATA_KEY = "swagger:api-property";
  return Reflect.getMetadata(API_PROPERTY_METADATA_KEY, target) || {};
}

export function getApiResponses(target: any, propertyKey: string | symbol): Record<string, any> {
  return Reflect.getMetadata(API_RESPONSE_METADATA_KEY, target, propertyKey) || {};
}
