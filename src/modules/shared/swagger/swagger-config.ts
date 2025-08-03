export interface SwaggerConfig {
  title?: string;
  version?: string;
  description?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  basePath?: string;
}

export class SwaggerConfigManager {
  private config: SwaggerConfig;

  constructor(config: SwaggerConfig = {}) {
    this.config = {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
      servers: [{ url: "http://localhost:3000", description: "Development server" }],
      basePath: "/api",
      ...config,
    };
  }

  public getConfig(): SwaggerConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<SwaggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public createBaseSpec(): any {
    return {
      openapi: "3.0.3",
      info: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description,
      },
      servers: this.config.servers,
      paths: {},
      components: {
        schemas: {},
      },
      tags: [],
    };
  }

  public getBasePath(): string {
    return this.config.basePath || "/api";
  }
}
