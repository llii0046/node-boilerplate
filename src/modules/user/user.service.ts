import { CreateUserDto, UpdateUserDto } from "./dto";
import { NotFoundError, ConflictError } from "@/shares/error";
import { LoggerService } from "../shared/logger";
import { IPrismaService } from "../shared/prisma";
import { PaginationDto } from "@/shares/dto";

export class UserService {
  constructor(
    private prismaService: IPrismaService,
    private loggerService: LoggerService,
  ) {}

  async getUsers(dto: PaginationDto) {
    const { page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    this.loggerService?.info("Fetching users", { page, limit, skip });

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.user.count(),
    ]);

    this.loggerService.info("Users fetched successfully", {
      count: users.length,
      total,
      page,
      limit,
    });

    return { users, total };
  }

  async getUserById(id: string) {
    this.loggerService?.info("Looking for user by ID", { id });

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.loggerService?.info("User lookup result", { found: !!user, id });

    if (!user) {
      this.loggerService?.warn("User not found", { id });
      throw new NotFoundError("User not found");
    }

    this.loggerService?.info("User found successfully", { id: user.id, email: user.email });
    return user;
  }

  async createUser(userData: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const user = await this.prismaService.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, userData: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // If updating email, check if new email is already used by another user
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.prismaService.user.findUnique({
        where: { email: userData.email },
      });

      if (emailExists) {
        throw new ConflictError("Email already exists");
      }
    }

    const user = await this.prismaService.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return true;
  }
}
