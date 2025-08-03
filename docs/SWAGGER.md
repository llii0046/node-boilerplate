# Swagger Decorators Usage Guide

This project implements a Swagger decorator system similar to NestJS that can automatically generate OpenAPI documentation.

## Features

- ✅ `@ApiProperty` - Mark DTO properties
- ✅ `@ApiResponse` - Mark API responses
- ✅ `@ApiOperation` - Mark API operations
- ✅ `@ApiTags` - Mark controller groups
- ✅ `@ApiParam` - Mark path parameters
- ✅ `@ApiQuery` - Mark query parameters
- ✅ `@ApiBody` - Mark request body parameters
- ✅ Route decorators (`@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`)
- ✅ Automatic OpenAPI 3.0.3 specification generation
- ✅ Automatic Swagger UI documentation generation

## Quick Start

### 1. Create DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from "@/shares/swagger/decorators/index.js";

export class CreateUserDto {
  @ApiProperty({
    description: "User email",
    example: "user@example.com",
    required: true,
  })
  email!: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  name!: string;

  @ApiPropertyOptional({
    description: "User age",
    example: 25,
    minimum: 0,
    maximum: 150,
  })
  age?: number;
}
```

### 2. Create Controller

```typescript
import { Request, Response } from "express";
import { ControllerBase } from "@/shares/swagger/controller-base.js";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  Get,
  Post,
  Put,
  Delete,
} from "@/shares/swagger/decorators/index.js";
import { CreateUserDto, UserResponseDto } from "./dto/user.dto.js";

@ApiTags("Users")
export class UserController extends ControllerBase {
  constructor() {
    super("/users"); // Set base path
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
    type: UserResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: "Request parameter error",
  })
  async getUsers(req: Request, res: Response) {
    // Implement logic
    res.json({ data: [], total: 0 });
  }

  @Post()
  @ApiOperation({
    summary: "Create user",
    description: "Create new user",
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
  })
  async createUser(req: Request, res: Response) {
    // Implement logic
    res.status(201).json({});
  }
}
```

### 3. Register Module

```typescript
import { SwaggerService } from "@/shares/swagger/swagger.service.js";

export class AppModule {
  private swaggerService: SwaggerService;

  constructor() {
    this.swaggerService = new SwaggerService({
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
      servers: [{ url: "http://localhost:3000" }],
      basePath: "/api",
    });

    this.setupSwagger();
  }

  private setupSwagger(): void {
    // Add controller Swagger generators
    const userController = new UserController();
    this.swaggerService.addGenerator(userController.getSwaggerGenerator());

    // Set Swagger UI routes
    this.router.use("/docs", swaggerUi.serve, swaggerUi.setup(this.swaggerService.generateSpec()));
    this.router.get("/openapi.json", (_req, res) => res.json(this.swaggerService.generateSpec()));
  }
}
```

## Decorator Details

### @ApiProperty

Used to mark properties of DTO classes:

```typescript
@ApiProperty({
  description?: string;        // Property description
  example?: any;              // Example value
  required?: boolean;         // Required
  type?: string;             // Data type
  format?: string;           // Data format (e.g., date-time)
  enum?: any[];              // Enumeration values
  minLength?: number;        // Minimum length
  maxLength?: number;        // Maximum length
  minimum?: number;          // Minimum value
  maximum?: number;          // Maximum value
  pattern?: string;          // Regular expression
  items?: any;               // Array item type
  additionalProperties?: boolean; // Whether to allow additional properties
})
```

### @ApiResponse

Used to mark API responses:

```typescript
@ApiResponse({
  status: number;            // HTTP status code
  description?: string;      // Response description
  type?: any;               // Response type
  isArray?: boolean;        // Whether it's an array
  example?: any;            // Example response
  headers?: Record<string, any>; // Response headers
})
```

Predefined response decorators:

- `@ApiOkResponse()` - 200 response
- `@ApiCreatedResponse()` - 201 response
- `@ApiBadRequestResponse()` - 400 response
- `@ApiUnauthorizedResponse()` - 401 response
- `@ApiNotFoundResponse()` - 404 response
- `@ApiInternalServerErrorResponse()` - 500 response

### @ApiOperation

Used to mark API operations:

```typescript
@ApiOperation({
  summary?: string;          // Operation summary
  description?: string;      // Operation description
  tags?: string[];          // Tag groups
  deprecated?: boolean;      // Whether deprecated
  externalDocs?: {           // External documentation
    description: string;
    url: string;
  };
})
```

### @ApiParam

Used to mark path parameters:

```typescript
@ApiParam({
  name: string;              // Parameter name
  description?: string;      // Parameter description
  required?: boolean;        // Required (default true)
  type?: string;            // Data type
  format?: string;          // Data format
  example?: any;            // Example value
  enum?: any[];             // Enumeration values
  pattern?: string;         // Regular expression
  minimum?: number;         // Minimum value
  maximum?: number;         // Maximum value
  minLength?: number;       // Minimum length
  maxLength?: number;       // Maximum length
})
```

### @ApiQuery

Used to mark query parameters:

```typescript
@ApiQuery({
  name: string;              // Parameter name
  description?: string;      // Parameter description
  required?: boolean;        // Required (default false)
  type?: string;            // Data type
  format?: string;          // Data format
  example?: any;            // Example value
  enum?: any[];             // Enumeration values
  pattern?: string;         // Regular expression
  minimum?: number;         // Minimum value
  maximum?: number;         // Maximum value
  minLength?: number;       // Minimum length
  maxLength?: number;       // Maximum length
  allowEmptyValue?: boolean; // Whether to allow empty values
  allowReserved?: boolean;   // Whether to allow reserved characters
  explode?: boolean;        // Whether to expand arrays
  style?: 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject'; // Parameter style
})
```

### @ApiBody

Used to mark request body parameters:

```typescript
@ApiBody({
  type?: any;               // Request body type (DTO class)
  description?: string;     // Request body description
  required?: boolean;       // Required (default false)
  content?: Record<string, any>; // Custom content type
  examples?: Record<string, any>; // Example data
})
```

### @ApiTags

Used to mark controller groups:

```typescript
@ApiTags("Users", "Authentication")
export class UserController extends ControllerBase {
  // ...
}
```

### Route Decorators

```typescript
@Get()           // GET /
@Get('/:id')     // GET /:id
@Post()          // POST /
@Put('/:id')     // PUT /:id
@Delete('/:id')  // DELETE /:id
@Patch('/:id')   // PATCH /:id
```

## Accessing Documentation

After starting the server, access the following addresses:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/openapi.json`

## Notes

1. Ensure decorators are enabled in `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

2. Import `reflect-metadata` in your project entry file:

   ```typescript
   import "reflect-metadata";
   ```

3. Controllers must inherit the `ControllerBase` class to automatically register routes and generate Swagger documentation.

4. DTO classes must use the `@ApiProperty` decorator to mark properties to generate the correct schema.

## Example Project

See the complete example in the `src/modules/user/` directory:

- `user.dto.ts` - DTO definition
- `user.controller.ts` - Controller implementation
- `user.module.ts` - Module registration
