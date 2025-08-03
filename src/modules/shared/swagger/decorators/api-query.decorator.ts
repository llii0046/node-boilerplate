import "reflect-metadata";

export interface ApiQueryOptions {
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
  allowEmptyValue?: boolean;
  allowReserved?: boolean;
  explode?: boolean;
  style?: "form" | "spaceDelimited" | "pipeDelimited" | "deepObject";
}

const API_QUERY_METADATA_KEY = "swagger:api-query";

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const querySchema = {
      name: options.name,
      in: "query",
      description: options.description,
      required: options.required || false,
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
      allowEmptyValue: options.allowEmptyValue,
      allowReserved: options.allowReserved,
      explode: options.explode,
      style: options.style,
    };

    // Remove undefined values
    Object.keys(querySchema.schema).forEach((key) => {
      if (querySchema.schema[key as keyof typeof querySchema.schema] === undefined) {
        delete querySchema.schema[key as keyof typeof querySchema.schema];
      }
    });

    // Remove undefined values
    Object.keys(querySchema).forEach((key) => {
      if (querySchema[key as keyof typeof querySchema] === undefined) {
        delete querySchema[key as keyof typeof querySchema];
      }
    });

    // Get existing query parameter metadata
    const existingQueries = Reflect.getMetadata(API_QUERY_METADATA_KEY, target, propertyKey) || [];
    existingQueries.push(querySchema);

    Reflect.defineMetadata(API_QUERY_METADATA_KEY, existingQueries, target, propertyKey);
  };
}

export function getApiQueries(target: any, propertyKey: string | symbol): ApiQueryOptions[] {
  return Reflect.getMetadata(API_QUERY_METADATA_KEY, target, propertyKey) || [];
}
