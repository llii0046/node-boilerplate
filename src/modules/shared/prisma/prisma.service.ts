import { PrismaClient } from "@prisma/client";

export interface IPrismaService {
  getClient(): PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  user: PrismaClient["user"];
}

export class PrismaService implements IPrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  // Provide convenient model access methods
  public get user() {
    return this.prisma.user;
  }

  // Connection management
  public async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
