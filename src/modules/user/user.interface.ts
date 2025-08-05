import { Request, Response, NextFunction } from "express";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto";
import { PaginationDto } from "@/shares/dto";
import { PaginatedResult } from "prisma-pagination";

// User service interface
export interface IUserService {
  findAll(dto: PaginationDto): Promise<PaginatedResult<UserResponseDto>>;
  findById(id: string): Promise<UserResponseDto>;
  findByEmail(email: string): Promise<UserResponseDto>;
  create(dto: CreateUserDto): Promise<UserResponseDto>;
  update(id: string, data: UpdateUserDto): Promise<UserResponseDto>;
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
