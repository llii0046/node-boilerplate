import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { Expose, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@/modules/shared/swagger/decorators/index.js";

/**
 * Create user DTO
 */
export class CreateUserDto {
  @ApiProperty({
    description: "User email",
    example: "user@example.com",
    required: true,
  })
  @IsEmail({}, { message: "Email format is incorrect" })
  @Expose()
  email!: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
    required: true,
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: "Name must be a string" })
  @MinLength(1, { message: "Name cannot be empty" })
  @MaxLength(50, { message: "Name length cannot exceed 50 characters" })
  @IsOptional()
  @Expose()
  name?: string;

  @ApiPropertyOptional({
    description: "User password",
    example: "password123",
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password length cannot be less than 6 characters" })
  @MaxLength(100, { message: "Password length cannot exceed 100 characters" })
  @IsOptional()
  @Expose()
  password?: string;

  @ApiPropertyOptional({
    description: "User age",
    example: 25,
    minimum: 0,
    maximum: 150,
  })
  @IsInt({ message: "Age must be an integer" })
  @Min(0, { message: "Age cannot be less than 0" })
  @Max(150, { message: "Age cannot be greater than 150" })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Expose()
  age?: number;

  @ApiPropertyOptional({
    description: "User activation status",
    example: true,
  })
  @IsBoolean({ message: "Activation status must be a boolean" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @Expose()
  isActive?: boolean = true;
}
