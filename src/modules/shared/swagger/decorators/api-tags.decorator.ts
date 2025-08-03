import "reflect-metadata";

const API_TAGS_METADATA_KEY = "swagger:api-tags";

export function ApiTags(...tags: string[]): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(API_TAGS_METADATA_KEY, tags, target);
  };
}

export function getApiTags(target: any): string[] {
  return Reflect.getMetadata(API_TAGS_METADATA_KEY, target) || [];
}
