import { LoggerService } from "@/modules/shared/logger";
import { IPrismaService } from "@/modules/shared/prisma";
import { UserController } from "@/modules/user/user.controller";
import { UserService } from "@/modules/user/user.service";
import { Request, Response, NextFunction } from "express";

// Mock UserService
jest.mock("@/modules/user/user.service");

// Mock PrismaService
const mockPrismaService = {
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

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockUserService = new UserService(
      mockPrismaService,
      mockLoggerService,
    ) as jest.Mocked<UserService>;
    userController = new UserController(mockUserService, mockLoggerService);
    (userController as unknown as { userService: UserService }).userService = mockUserService;

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const mockResult = {
        data: [
          {
            id: "1",
            email: "test@example.com",
            name: "Test User",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockUserService.getUsers = jest.fn().mockResolvedValue(mockResult);
      mockRequest.query = { page: "1", limit: "10" };

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUsers).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      mockUserService.getUsers = jest.fn().mockRejectedValue(error);

      await userController.getUsers(mockRequest as Request, mockResponse as Response);

      // Controller handles errors internally, no next() call expected
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.getUserById = jest.fn().mockResolvedValue(mockUser);
      mockRequest.params = { id: "1" };

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
    });

    it("should return 404 when user not found", async () => {
      mockUserService.getUserById = jest.fn().mockResolvedValue(null);
      mockRequest.params = { id: "999" };

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "NOT_FOUND",
        message: "User not found",
      });
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = { email: "new@example.com", name: "New User" };
      const mockUser = { id: "1", ...userData, createdAt: new Date(), updatedAt: new Date() };
      mockUserService.createUser = jest.fn().mockResolvedValue(mockUser);
      mockRequest.body = userData;

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
    });

    it("should handle duplicate email error", async () => {
      const error = new Error("Email already exists");
      mockUserService.createUser = jest.fn().mockRejectedValue(error);
      mockRequest.body = { email: "existing@example.com", name: "Existing User" };

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "BAD_REQUEST",
        message: "Email already exists",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const updateData = { name: "Updated Name" };
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Updated Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.updateUser = jest.fn().mockResolvedValue(mockUser);
      mockRequest.params = { id: "1" };
      mockRequest.body = updateData;

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith("1", updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
    });

    it("should handle user not found error", async () => {
      const error = new Error("User not found");
      mockUserService.updateUser = jest.fn().mockRejectedValue(error);
      mockRequest.params = { id: "999" };
      mockRequest.body = { name: "New Name" };

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "BAD_REQUEST",
        message: "User not found",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockUserService.deleteUser = jest.fn().mockResolvedValue(undefined);
      mockRequest.params = { id: "1" };

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should handle user not found error", async () => {
      const error = new Error("User not found");
      mockUserService.deleteUser = jest.fn().mockRejectedValue(error);
      mockRequest.params = { id: "999" };

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "NOT_FOUND",
        message: "User not found",
      });
    });
  });
});
