import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import { CreateUserDto, UpdateUserDto } from "./dto";

// User service interface
export interface IUserService {
  findAll(
    page?: number,
    limit?: number,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// User controller interface
export interface IUserController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
  createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}

// Pagination query parameters interface
export interface PaginationQuery {
  page?: number;
  limit?: number;
}
