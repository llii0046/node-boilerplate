import { Request, Response } from "express";
import {
  ControllerBase,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  Get,
  Post,
  Put,
  Delete,
  ErrorResponseDto,
  ValidationErrorResponseDto,
  ConflictErrorResponseDto,
} from "@/modules/shared/swagger";
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserListResponseDto } from "./dto";
import { UserService } from "./user.service";
import { NotFoundError, BadRequestError, ConflictError, InternalServerError } from "@/shares/error";
import { IUserController } from "./user.interface";
import { LoggerService } from "../shared/logger";

@ApiTags("Users")
export class UserController extends ControllerBase implements IUserController {
  constructor(
    private userService: UserService,
    private loggerService: LoggerService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({
    summary: "Get user list",
    description: "Get all user information with pagination",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    type: "integer",
    example: 1,
    minimum: 1,
  })
  @ApiQuery({
    name: "limit",
    description: "Items per page",
    type: "integer",
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @ApiOkResponse({
    description: "Successfully retrieved user list",
    type: UserListResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Request parameter error",
    type: ErrorResponseDto,
  })
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestError("Invalid pagination parameters");
      }

      const result = await this.userService.getUsers({ page, limit });

      res.json({
        data: result.users,
        total: result.total,
        page,
        limit,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else {
        throw new InternalServerError("Internal server error");
      }
    }
  }

  @Get("/:id")
  @ApiOperation({
    summary: "Get single user",
    description: "Get user detailed information by user ID",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: "string",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOkResponse({
    description: "Successfully retrieved user information",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
    type: ErrorResponseDto,
  })
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      res.json(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else {
        throw new InternalServerError("Internal server error");
      }
    }
  }

  @Post()
  @ApiOperation({
    summary: "Create user",
    description: "Create a new user",
  })
  @ApiBody({
    type: CreateUserDto,
    description: "User creation data",
  })
  @ApiCreatedResponse({
    description: "User created successfully",
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Request data validation failed",
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: "Email already exists",
    type: ConflictErrorResponseDto,
  })
  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserDto = req.body;
      const user = await this.userService.createUser(userData);

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else {
        throw new InternalServerError("Internal server error");
      }
    }
  }

  @Put("/:id")
  @ApiOperation({
    summary: "Update user",
    description: "Update specified user information",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: "string",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({
    type: UpdateUserDto,
    description: "User update data",
  })
  @ApiOkResponse({
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Request data validation failed",
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: "Email is already used by another user",
    type: ConflictErrorResponseDto,
  })
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;

      const user = await this.userService.updateUser(id, userData);

      res.json(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else if (error instanceof ConflictError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else {
        throw new InternalServerError("Internal server error");
      }
    }
  }

  @Delete("/:id")
  @ApiOperation({
    summary: "Delete user",
    description: "Delete specified user",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: "string",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOkResponse({
    description: "User deleted successfully",
    example: { message: "User deleted successfully" },
  })
  @ApiNotFoundResponse({
    description: "User not found",
    type: ErrorResponseDto,
  })
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          error: error.errorCode,
          message: error.message,
        });
      } else {
        throw new InternalServerError("Internal server error");
      }
    }
  }
}
