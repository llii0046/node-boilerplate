import "reflect-metadata";

export interface RouteMetadata {
  path: string;
  method: string;
}

const ROUTE_METADATA_KEY = "swagger:route";

export function Get(path: string = ""): MethodDecorator {
  return createRouteDecorator("get", path);
}

export function Post(path: string = ""): MethodDecorator {
  return createRouteDecorator("post", path);
}

export function Put(path: string = ""): MethodDecorator {
  return createRouteDecorator("put", path);
}

export function Delete(path: string = ""): MethodDecorator {
  return createRouteDecorator("delete", path);
}

export function Patch(path: string = ""): MethodDecorator {
  return createRouteDecorator("patch", path);
}

function createRouteDecorator(method: string, path: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const routeMetadata: RouteMetadata = {
      path,
      method: method.toUpperCase(),
    };

    Reflect.defineMetadata(ROUTE_METADATA_KEY, routeMetadata, target, propertyKey);
  };
}

export function getRouteMetadata(
  target: any,
  propertyKey: string | symbol,
): RouteMetadata | undefined {
  return Reflect.getMetadata(ROUTE_METADATA_KEY, target, propertyKey);
}
