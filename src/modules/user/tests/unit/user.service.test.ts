import { UserService } from "../../user.service";
import { LoggerService } from "@/modules/shared/logger";
import { IPrismaService } from "@/modules/shared/prisma";

// Mock PrismaClient
const mockPrismaClient = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as unknown as IPrismaService;

// Mock LoggerService
const mockLoggerService = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  operation: jest.fn(),
} as unknown as LoggerService;

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Create UserService instance and inject mock dependencies
    userService = new UserService(mockPrismaClient, mockLoggerService);
  });

  describe("getUsers", () => {
    it("should return users with pagination", async () => {
      const mockUsers = [
        { id: "1", email: "test1@example.com", name: "Test User 1" },
        { id: "2", email: "test2@example.com", name: "Test User 2" },
      ];

      (mockPrismaClient.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrismaClient.user.count as jest.Mock).mockResolvedValue(2);

      const result = await userService.getUsers({ page: 1, limit: 10 });

      expect(mockLoggerService.info).toHaveBeenCalledWith("Starting getUsers", {
        page: 1,
        limit: 10,
      });
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockPrismaClient.user.count).toHaveBeenCalled();
      expect(mockLoggerService.operation).toHaveBeenCalledWith({
        operation: "getUsers",
        status: "success",
        duration: expect.any(Number),
        data: { count: 2, total: 2, page: 1, limit: 10 },
      });
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById("1");

      expect(mockLoggerService.debug).toHaveBeenCalledWith("Starting getUserById", { userId: "1" });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockLoggerService.operation).toHaveBeenCalledWith({
        operation: "getUserById",
        status: "success",
        duration: expect.any(Number),
        data: { userId: "1", found: true },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundError when user not found", async () => {
      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById("999")).rejects.toThrow("User not found");
      expect(mockLoggerService.warn).toHaveBeenCalledWith("User not found", {
        userId: "999",
        duration: expect.any(Number),
      });
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = { email: "new@example.com", name: "New User" };
      const mockUser = { id: "1", ...userData };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrismaClient.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);

      expect(mockLoggerService.info).toHaveBeenCalledWith("Starting createUser", {
        email: userData.email,
      });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockLoggerService.operation).toHaveBeenCalledWith({
        operation: "createUser",
        status: "success",
        duration: expect.any(Number),
        data: { userId: "1", email: userData.email },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw ConflictError when email already exists", async () => {
      const userData = { email: "existing@example.com", name: "New User" };
      const existingUser = { id: "1", email: "existing@example.com", name: "Existing User" };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(userService.createUser(userData)).rejects.toThrow("Email already exists");
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        "Email already exists during user creation",
        {
          email: userData.email,
          duration: expect.any(Number),
          existingUserId: existingUser.id,
        },
      );
    });
  });
});
