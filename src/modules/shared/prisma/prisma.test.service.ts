import { PrismaClient } from "@prisma/client";
import { IPrismaService } from "./prisma.service";

export class PrismaTestService implements IPrismaService {
  private static instance: PrismaTestService;
  private prisma: PrismaClient;

  private constructor() {
    // Use test schema for Prisma client
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: "file:./test.db",
        },
      },
    });
  }

  public static getInstance(): PrismaTestService {
    if (!PrismaTestService.instance) {
      PrismaTestService.instance = new PrismaTestService();
    }
    return PrismaTestService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  // Provide convenient model access methods
  public get user() {
    return this.prisma.user;
  }

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

  public async cleanDatabase(): Promise<void> {
    // Clean up all tables in reverse order of dependencies
    await this.prisma.userTag.deleteMany();
    await this.prisma.tag.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.comment.deleteMany();
    await this.prisma.post.deleteMany();
    await this.prisma.profile.deleteMany();
    await this.prisma.user.deleteMany();
  }

  public async resetDatabase(): Promise<void> {
    await this.cleanDatabase();
    // You can add seed data here if needed
  }
} 