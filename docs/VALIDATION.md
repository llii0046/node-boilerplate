# Type-Safe Validation System Usage Guide

## 🎯 Overview

The rewritten validation system has the following features:

- ✅ **Fully Type-Safe** - Using TypeScript generics and strict types
- ✅ **Modern API** - Using the latest class-transformer API
- ✅ **Flexible Configuration** - Supporting detailed validation options
- ✅ **Composable Validation** - Supporting multiple validation middleware combinations
- ✅ **Conditional Validation** - Supporting conditional validation
- ✅ **Error Handling** - Structured error responses

## ✨ Major Improvements

### 1. Type Safety

```typescript
// Old version - using any
export function validateDto(dtoClass: any, validationGroup?: string);

// New version - fully type-safe
export function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  options: ValidationOptions = {},
): ValidationMiddleware;
```

### 2. Modern API

```typescript
// Old version - using deprecated plainToClass
const dtoInstance = plainToClass(dtoClass, req.body, options);

// New version - using new plainToInstance
const dtoInstance = plainToInstance(dtoClass, req.body, options);
```

### 3. Flexible Configuration

```typescript
// New version supports detailed configuration options
const options: ValidationOptions = {
  validationGroup: "update",
  transformOptions: {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  },
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
};
```

## 🚀 Usage Examples

### 1. Basic Validation

```typescript
import { validateDto, validateQuery, validateParams } from "@/shares/validation";
import { CreateUserDto, QueryUserListDto, UserParamsDto } from "./user.dto.class.js";

// Request body validation
router.post("/users", validateDto(CreateUserDto), userController.createUser);

// Query parameter validation
router.get("/users", validateQuery(QueryUserListDto), userController.getUsers);

// Path parameter validation
router.get("/users/:id", validateParams(UserParamsDto), userController.getUserById);
```

### 2. Advanced Configuration

```typescript
// Using validation groups
router.put(
  "/users/:id",
  validateDto(UpdateUserDto, { validationGroup: "update" }),
  userController.updateUser,
);

// Custom transform options
router.post(
  "/users",
  validateDto(CreateUserDto, {
    transformOptions: {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    },
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
  userController.createUser,
);
```

### 3. Composable Validation

```typescript
import { combineValidationMiddlewares } from "@/shares/validation";

// Combine multiple validation middlewares
router.put(
  "/users/:id",
  combineValidationMiddlewares(validateParams(UserParamsDto), validateDto(UpdateUserDto)),
  userController.updateUser,
);
```

### 4. Conditional Validation

```typescript
import { conditionalValidation } from "@/shares/validation";

// Only validate under specific conditions
router.post(
  "/users",
  conditionalValidation((req) => req.body.requiresValidation === true, validateDto(CreateUserDto)),
  userController.createUser,
);
```

### 5. Decorator Validation

```typescript
import { Validate } from "@/shares/validation";

export class UserController {
  @Validate(CreateUserDto)
  async createUser(req: Request, res: Response) {
    // req.body has already been validated and transformed
    const user = await this.userService.create(req.body);
    res.status(201).json({ data: user });
  }

  @Validate(UpdateUserDto, { validationGroup: "update" })
  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await this.userService.update(id, req.body);
    res.json({ data: user });
  }
}
```

## 🔧 Configuration Options

### ValidationOptions Interface

```typescript
export interface ValidationOptions extends Partial<ValidatorOptions> {
  validationGroup?: string;
  transformOptions?: {
    excludeExtraneousValues?: boolean;
    enableImplicitConversion?: boolean;
  };
}
```

### Available Options

| Option                                      | Type      | Default     | Description      |
| ------------------------------------------- | --------- | ----------- | ---------------- |
| `validationGroup`                           | `string`  | `undefined` | Validation group name |
| `transformOptions.excludeExtraneousValues`  | `boolean` | `true`      | Exclude extra properties |
| `transformOptions.enableImplicitConversion` | `boolean` | `true`      | Enable implicit conversion |
| `whitelist`                                 | `boolean` | `true`      | Whitelist mode |
| `forbidNonWhitelisted`                      | `boolean` | `true`      | Forbid non-whitelisted properties |
| `forbidUnknownValues`                       | `boolean` | `true`      | Forbid unknown values |

## 📝 Error Handling

### Error Response Format

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "statusCode": 422,
  "details": [
    {
      "field": "email",
      "value": "invalid-email",
      "constraints": ["Email format is incorrect"]
    },
    {
      "field": "age",
      "value": "not-a-number",
      "constraints": ["Age must be an integer", "Age cannot be less than 0"]
    }
  ]
}
```

### Error Types

- `VALIDATION_ERROR` - Request body validation failed
- `QUERY_VALIDATION_ERROR` - Query parameter validation failed
- `PARAMS_VALIDATION_ERROR` - Path parameter validation failed

## 🎛️ Validation Groups

### Define Validation Groups

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: "Email format is incorrect" })
  @Expose()
  email!: string;

  @IsString({ message: "Name must be a string" })
  @IsOptional()
  @Expose()
  name?: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @IsOptional({ groups: ["update"] })
  @Expose()
  password?: string;
}
```

### Use Validation Groups

```typescript
// Validate when creating (includes password)
router.post("/users", validateDto(CreateUserDto), userController.createUser);

// Validate when updating (password optional)
router.put(
  "/users/:id",
  validateDto(CreateUserDto, { validationGroup: "update" }),
  userController.updateUser,
);
```

## 🔄 Type Conversion

### Automatic Conversion Example

```typescript
export class CreateUserDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "Age must be an integer" })
  @Expose()
  age?: number;

  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean({ message: "IsActive must be a boolean" })
  @Expose()
  isActive?: boolean;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: "Date format is incorrect" })
  @Expose()
  createdAt?: Date;
}
```

## 🧪 Testing

### Run Tests

```bash
npm run test:validation
```

### Test Output Example

```
🧪 Testing the new type-safe validation system

=== Testing CreateUserDto ===
✅ Create user data validation passed
📝 Validated data: CreateUserDto {
  isActive: true,
  email: 'test@example.com',
  name: 'Test User',
  age: 25
}

=== Testing invalid data ===
❌ Invalid data validation failed (expected result):
  - email: Email format is incorrect
  - name: Name cannot be empty
  - age: Age must be an integer

=== Testing Type Safety ===
✅ TypeScript type inference works correctly
  - email type: string
  - name type: string
  - age type: number
```

## 🎯 Best Practices

### 1. Type Safety

```typescript
// Good practice - use generics
export function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  options: ValidationOptions = {},
): ValidationMiddleware;

// Avoid practice - use any
export function validateDto(dtoClass: any, options: any = {});
```

### 2. Error Handling

```typescript
// Good practice - use custom error class
throw new CustomValidationError("Validation failed", formattedErrors);

// Avoid practice - use generic error
throw new Error("Validation failed");
```

### 3. Configuration Options

```typescript
// Good practice - use interface to define options
interface ValidationOptions {
  validationGroup?: string;
  transformOptions?: TransformOptions;
}

// Avoid practice - use loose object
const options = { group: "update", transform: true };
```

### 4. Composable Validation

```typescript
// Good practice - use composition function
combineValidationMiddlewares(validateParams(UserParamsDto), validateDto(UpdateUserDto));

// Avoid practice - manually combine
router.put(
  "/:id",
  validateParams(UserParamsDto),
  validateDto(UpdateUserDto),
  userController.updateUser,
);
```

## 🔗 Related Files

- `src/shares/validation/validation.middleware.ts` - Validation middleware
- `src/modules/user/user.dto.class.ts` - DTO examples
- `test-validation-new.ts` - Validation tests
- `src/index.ts` - Application entry (includes reflect-metadata)

## 📚 More Resources

- [class-validator documentation](https://github.com/typestack/class-validator)
- [class-transformer documentation](https://github.com/typestack/class-transformer)
- [reflect-metadata documentation](https://github.com/rbuckton/reflect-metadata)
