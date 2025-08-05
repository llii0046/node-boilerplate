import request from "supertest";
import express from "express";
import { AppModule } from "@/app.module";
import { PrismaTestService } from "@/modules/shared/prisma/prisma.test.service";
import { AppError, ValidationError } from "@/shares/error";
import { SharedTestModule } from "@/modules/shared/shared.test.module";
import { UserModule } from "@/modules/user/user.module";
import { HealthController } from "@/modules/health/health.controller";

// Create a test app instance
const createTestApp = async () => {
  const app = express();
  app.use(express.json());
  
  // Use test modules instead of production modules
  const sharedTestModule = new SharedTestModule();
  await sharedTestModule.onModuleInit();
  
  const userModule = new UserModule(
    sharedTestModule.getPrismaService(),
    sharedTestModule.getLoggerService(),
  );
  const healthController = new HealthController();
  
  // Set up routes
  app.use("/api/users", userModule.getRouter());
  app.use("/api/health", healthController.getRouter());
  
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
  let prismaService: PrismaTestService;
  let testApp: express.Application;

  beforeAll(async () => {
    // Create test app
    testApp = await createTestApp();
    
    prismaService = PrismaTestService.getInstance();
    await prismaService.connect();
    // Don't clean database - use pre-seeded data
  });

  afterAll(async () => {
    await prismaService.disconnect();
  });

  describe("GET /api/users", () => {
    it("should return users list", async () => {
      const response = await request(testApp).get("/api/users").expect(200);

      // Should return seeded users
      expect(response.body.data).toHaveLength(3); // 3 users from seed
      expect(response.body.meta.total).toBe(3);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.perPage).toBe(10);
    });

    it("should return paginated users", async () => {
      const response = await request(testApp).get("/api/users?page=1&limit=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(3); // 3 users from seed
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.perPage).toBe(1);
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

      // Don't clean up - let it persist for other tests
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
        email: "test1@example.com", // Use existing email from seed
        name: "Test User",
      };

      // Try to create user with duplicate email
      const response = await request(testApp).post("/api/users").send(userData).expect(409);

      expect(response.body.error).toBe("CONFLICT");
      expect(response.body.message).toBe("Email already exists");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user by id", async () => {
      const user = await prismaService.getClient().user.create({
        data: { email: "getuser@example.com", name: "Get User" },
      });

      const response = await request(testApp).get(`/api/users/${user.id}`).expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Clean up test data
      await prismaService.getClient().user.delete({ where: { id: user.id } });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testApp).get("/api/users/non-existent-id").expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user", async () => {
      const user = await prismaService.getClient().user.create({
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
      await prismaService.getClient().user.delete({ where: { id: user.id } });
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
      const user = await prismaService.getClient().user.create({
        data: { email: "deleteuser@example.com", name: "User" },
      });

      await request(testApp).delete(`/api/users/${user.id}`).expect(204);

      // Verify user was deleted
      const deletedUser = await prismaService.getClient().user.findUnique({ where: { id: user.id } });
      expect(deletedUser).toBeNull();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(testApp).delete("/api/users/non-existent-id").expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });
});
