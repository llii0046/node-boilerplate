import { PrismaService } from "./prisma.service.js";

// Simple dependency injection container
class Container {
  private services = new Map<string, any>();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  async initialize(): Promise<void> {
    // Initialize Prisma service
    const prismaService = new PrismaService();
    await prismaService.connect();
    this.register("prisma", prismaService);
  }

  async cleanup(): Promise<void> {
    const prismaService = this.get<PrismaService>("prisma");
    await prismaService.disconnect();
  }
}

// Global container instance
export const container = new Container();

// Export types
export { PrismaService } from "./prisma.service.js";
export type { IPrismaService } from "./prisma.service.js";
