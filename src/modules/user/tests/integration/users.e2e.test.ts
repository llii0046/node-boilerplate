import request from "supertest";
import express from "express";
import { AppModule } from "@/app.module";
import { PrismaService } from "@/modules/shared/prisma";
import { AppError, ValidationError } from "@/shares/error";

// Create a test app instance
const createTestApp = async () => {
  const app = express();
  app.use(express.json());
  
  const appModule = new AppModule();
  await appModule.onModuleInit();
  
  app.use("/api", appModule.getRouter());
  
  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: "NOT_FOUND",
      message: "Requested resource not found",
    });
  });
  
  // Global error handler
  app.use(
    (
      err: Error & { name?: string; code?: string; errors?: unknown[] },
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      // Handle custom AppError
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          error: err.errorCode,
          message: err.message,
          ...(err instanceof ValidationError && { details: err.details }),
        });
      }
  
      // Handle validation errors
      if (err.name === "ZodError") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Data validation failed",
          details: err.errors,
        });
      }
  
      // Handle Prisma errors
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "CONFLICT",
          message: "Data already exists",
        });
      }
  
      // Default error
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Internal server error",
      });
    },
  );
  
  return app;
};

describe("Users API", () => {
  let prismaService: PrismaService;
  let testApp: express.Application;

  beforeAll(async () => {
    // Create test app
    testApp = await createTestApp();
    
    prismaService = new PrismaService();
    await prismaService.connect();
    // Clean up test data
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.disconnect();
  });

  describe("GET /api/users", () => {
    it("should return empty users list", async () => {
      const response = await request(testApp).get("/api/users").expect(200);

      expect(response.body).toEqual({
        data: [],
        meta: {
          total: 0,
          currentPage: 1,
          lastPage: 0,
          perPage: 10,
          prev: null,
          next: null,
        },
      });
    });

    it("should return paginated users", async () => {
      // Create test user
      const user1 = await prismaService.user.create({
        data: { email: "test1@example.com", name: "Test User 1" },
      });
      const user2 = await prismaService.user.create({
        data: { email: "test2@example.com", name: "Test User 2" },
      });

      const response = await request(testApp).get("/api/users?page=1&limit=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.perPage).toBe(1);

      // Clean up test data
      await prismaService.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "newuser@example.com",
        name: "New User",
      };

      const response = await request(testApp).post("/api/users").send(userData).expect(201);

      expect(response.body.data).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();

      // Clean up test data
      await prismaService.user.delete({ where: { id: response.body.data.id } });
    });

    it("should return 400 for invalid email", async () => {
      const userData = {
        email: "invalid-email",
        name: "Test User",
      };

      const response = await request(testApp).post("/api/users").send(userData).expect(422);

      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 409 for duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        name: "Test User",
      };

      // Create first user
      const user1 = await prismaService.user.create({ data: userData });

      // Try to create user with duplicate email
      const response = await request(testApp).post("/api/users").send(userData).expect(409);

      expect(response.body.error).toBe("CONFLICT");
      expect(response.body.message).toBe("Email already exists");

      // Clean up test data
      await prismaService.user.delete({ where: { id: user1.id } });
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user by id", async () => {
      const user = await prismaService.user.create({
        data: { email: "getuser@example.com", name: "Get User" },
      });

      const response = await request(testApp).get(`/api/users/${user.id}`).expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Clean up test data
      await prismaService.user.delete({ where: { id: user.id } });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testApp).get("/api/users/non-existent-id").expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user", async () => {
      const user = await prismaService.user.create({
        data: { email: "updateuser@example.com", name: "Original Name" },
      });

      const updateData = { name: "Updated Name" };

      const response = await request(testApp).put(`/api/users/${user.id}`).send(updateData).expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: updateData.name,
      });

      // Clean up test data
      await prismaService.user.delete({ where: { id: user.id } });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testApp)
        .put("/api/users/non-existent-id")
        .send({ name: "New Name" })
        .expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user", async () => {
      const user = await prismaService.user.create({
        data: { email: "deleteuser@example.com", name: "User" },
      });

      await request(testApp).delete(`/api/users/${user.id}`).expect(204);

      // Verify user was deleted
      const deletedUser = await prismaService.user.findUnique({ where: { id: user.id } });
      expect(deletedUser).toBeNull();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testApp).delete("/api/users/non-existent-id").expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });
});
