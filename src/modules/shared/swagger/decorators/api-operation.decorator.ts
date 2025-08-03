import "reflect-metadata";

export interface ApiOperationOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  externalDocs?: {
    description: string;
    url: string;
  };
}

const API_OPERATION_METADATA_KEY = "swagger:api-operation";

export function ApiOperation(options: ApiOperationOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const operationSchema = {
      summary: options.summary,
      description: options.description,
      tags: options.tags,
      deprecated: options.deprecated,
      externalDocs: options.externalDocs,
    };

    // Remove undefined values
    Object.keys(operationSchema).forEach((key) => {
      if (operationSchema[key as keyof typeof operationSchema] === undefined) {
        delete operationSchema[key as keyof typeof operationSchema];
      }
    });

    Reflect.defineMetadata(API_OPERATION_METADATA_KEY, operationSchema, target, propertyKey);
  };
}

export function getApiOperation(target: any, propertyKey: string | symbol): ApiOperationOptions {
  return Reflect.getMetadata(API_OPERATION_METADATA_KEY, target, propertyKey) || {};
}
