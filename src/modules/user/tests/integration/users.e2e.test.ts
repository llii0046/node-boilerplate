import request from "supertest";
import { app } from "@/app";
import { PrismaService } from "@/modules/shared/prisma";

describe("Users API", () => {
  let prismaService: PrismaService;

  beforeAll(async () => {
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
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
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

      const response = await request(app).get("/api/users?page=1&limit=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);

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

      const response = await request(app).post("/api/users").send(userData).expect(201);

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

      const response = await request(app).post("/api/users").send(userData).expect(400);

      expect(response.body.error).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        name: "Test User",
      };

      // Create first user
      const user1 = await prismaService.user.create({ data: userData });

      // Try to create user with duplicate email
      const response = await request(app).post("/api/users").send(userData).expect(400);

      expect(response.body.error).toBe("BAD_REQUEST");
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

      const response = await request(app).get(`/api/users/${user.id}`).expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // Clean up test data
      await prismaService.user.delete({ where: { id: user.id } });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/non-existent-id").expect(404);

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

      const response = await request(app).put(`/api/users/${user.id}`).send(updateData).expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: updateData.name,
      });

      // Clean up test data
      await prismaService.user.delete({ where: { id: user.id } });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .put("/api/users/non-existent-id")
        .send({ name: "New Name" })
        .expect(400);

      expect(response.body.error).toBe("BAD_REQUEST");
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user", async () => {
      const user = await prismaService.user.create({
        data: { email: "deleteuser@example.com", name: "User" },
      });

      await request(app).delete(`/api/users/${user.id}`).expect(204);

      // Verify user was deleted
      const deletedUser = await prismaService.user.findUnique({ where: { id: user.id } });
      expect(deletedUser).toBeNull();
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).delete("/api/users/non-existent-id").expect(404);

      expect(response.body.error).toBe("NOT_FOUND");
      expect(response.body.message).toBe("User not found");
    });
  });
});
