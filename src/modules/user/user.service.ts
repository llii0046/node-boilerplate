import { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto";
import { NotFoundError, ConflictError } from "@/shares/error";
import { LoggerService } from "../shared/logger";
import { IPrismaService } from "../shared/prisma";
import { PaginationDto } from "@/shares/dto";
import { IUserService } from "./user.interface";
import { createPaginator, PaginatedResult, PaginateFunction } from "prisma-pagination";

export class UserService implements IUserService {
  private paginate: PaginateFunction;

  constructor(
    private prismaService: IPrismaService,
    private loggerService: LoggerService,
  ) {
    this.paginate = createPaginator({});
  }

  async findAll(dto: PaginationDto): Promise<PaginatedResult<UserResponseDto>> {
    this.loggerService?.info("Fetching users", { page: dto.page, limit: dto.limit });

    const result = await this.paginate(
      this.prismaService.user,
      {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      {
        page: dto.page || 1,
        perPage: dto.limit || 10,
      },
    );

    this.loggerService.info("Users fetched successfully", result);

    return result as PaginatedResult<UserResponseDto>;
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.loggerService?.info("Looking for user by ID", { id });

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
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

  async findByEmail(email: string): Promise<UserResponseDto> {
    this.loggerService?.info("Looking for user by email", { email });

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.loggerService?.info("User lookup result", { found: !!user, email });

    if (!user) {
      this.loggerService?.warn("User not found", { email });
      throw new NotFoundError("User not found");
    }

    this.loggerService?.info("User found successfully", { id: user.id, email: user.email });
    return user;
  }

  async create(userData: CreateUserDto): Promise<UserResponseDto> {
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, userData: UpdateUserDto): Promise<UserResponseDto> {
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
