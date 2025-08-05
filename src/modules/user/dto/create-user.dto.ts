import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
} from "class-validator";
import { Expose, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@/modules/shared/swagger/decorators";
import { Prisma } from "@prisma/client";

/**
 * Create user DTO
 */
export class CreateUserDto implements Prisma.UserCreateInput {
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
    description: "User activation status",
    example: true,
  })
  @IsBoolean({ message: "Activation status must be a boolean" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @Expose()
  isActive?: boolean = true;
}
