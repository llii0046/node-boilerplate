import "reflect-metadata";

export interface ApiParamOptions {
  name: string;
  description?: string;
  required?: boolean;
  type?: string;
  format?: string;
  example?: any;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

const API_PARAM_METADATA_KEY = "swagger:api-param";

export function ApiParam(options: ApiParamOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const paramSchema = {
      name: options.name,
      in: "path",
      description: options.description,
      required: options.required !== false, // Path parameters are required by default
      schema: {
        type: options.type || "string",
        format: options.format,
        example: options.example,
        enum: options.enum,
        pattern: options.pattern,
        minimum: options.minimum,
        maximum: options.maximum,
        minLength: options.minLength,
        maxLength: options.maxLength,
      },
    };

    // Remove undefined values
    Object.keys(paramSchema.schema).forEach((key) => {
      if (paramSchema.schema[key as keyof typeof paramSchema.schema] === undefined) {
        delete paramSchema.schema[key as keyof typeof paramSchema.schema];
      }
    });

    // Get existing parameter metadata
    const existingParams = Reflect.getMetadata(API_PARAM_METADATA_KEY, target, propertyKey) || [];
    existingParams.push(paramSchema);

    Reflect.defineMetadata(API_PARAM_METADATA_KEY, existingParams, target, propertyKey);
  };
}

export function getApiParams(target: any, propertyKey: string | symbol): ApiParamOptions[] {
  return Reflect.getMetadata(API_PARAM_METADATA_KEY, target, propertyKey) || [];
}
