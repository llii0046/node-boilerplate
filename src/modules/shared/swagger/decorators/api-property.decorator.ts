import "reflect-metadata";

export interface ApiPropertyOptions {
  description?: string;
  example?: any;
  required?: boolean;
  type?: string;
  format?: string;
  enum?: any[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: any;
  additionalProperties?: boolean;
}

const API_PROPERTY_METADATA_KEY = "swagger:api-property";

export function ApiProperty(options: ApiPropertyOptions = {}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingProperties =
      Reflect.getMetadata(API_PROPERTY_METADATA_KEY, target.constructor) || {};

    const propertySchema = {
      type: options.type || getTypeFromMetadata(target, propertyKey),
      description: options.description,
      example: options.example,
      required: options.required,
      format: options.format,
      enum: options.enum,
      minLength: options.minLength,
      maxLength: options.maxLength,
      minimum: options.minimum,
      maximum: options.maximum,
      pattern: options.pattern,
      items: options.items,
      additionalProperties: options.additionalProperties,
    };

    // Remove undefined values
    Object.keys(propertySchema).forEach((key) => {
      if (propertySchema[key as keyof typeof propertySchema] === undefined) {
        delete propertySchema[key as keyof typeof propertySchema];
      }
    });

    existingProperties[propertyKey] = propertySchema;
    Reflect.defineMetadata(API_PROPERTY_METADATA_KEY, existingProperties, target.constructor);
  };
}

export function ApiPropertyOptional(options: ApiPropertyOptions = {}): PropertyDecorator {
  return ApiProperty({ ...options, required: false });
}

function getTypeFromMetadata(target: any, propertyKey: string | symbol): string {
  const designType = Reflect.getMetadata("design:type", target, propertyKey);

  if (!designType) return "string";

  switch (designType.name) {
    case "String":
      return "string";
    case "Number":
      return "number";
    case "Boolean":
      return "boolean";
    case "Array":
      return "array";
    case "Date":
      return "string";
    default:
      return "object";
  }
}

export function getApiProperties(target: any): Record<string, any> {
  return Reflect.getMetadata(API_PROPERTY_METADATA_KEY, target) || {};
}
