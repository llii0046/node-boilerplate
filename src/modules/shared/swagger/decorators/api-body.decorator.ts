import "reflect-metadata";

export interface ApiBodyOptions {
  type?: any;
  description?: string;
  required?: boolean;
  content?: Record<string, any>;
  examples?: Record<string, any>;
}

const API_BODY_METADATA_KEY = "swagger:api-body";

export function ApiBody(options: ApiBodyOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const bodySchema = {
      description: options.description,
      required: options.required || false,
      content: options.content || {
        "application/json": {
          schema: options.type ? { type: options.type } : { type: "object" },
          examples: options.examples,
        },
      },
    };

    // Remove undefined values
    Object.keys(bodySchema).forEach((key) => {
      if (bodySchema[key as keyof typeof bodySchema] === undefined) {
        delete bodySchema[key as keyof typeof bodySchema];
      }
    });

    Reflect.defineMetadata(API_BODY_METADATA_KEY, bodySchema, target, propertyKey);
  };
}

export function getApiBody(target: any, propertyKey: string | symbol): ApiBodyOptions {
  return Reflect.getMetadata(API_BODY_METADATA_KEY, target, propertyKey) || {};
}
