import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
} from "class-validator";
import { Expose, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@/modules/shared/swagger/decorators";
import { Prisma } from "@prisma/client";

/**
 * Update user DTO
 */
export class UpdateUserDto implements Prisma.UserUpdateInput {
  @ApiPropertyOptional({
    description: "User email",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Email format is incorrect" })
  @IsOptional()
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    description: "User name",
    example: "John Doe",
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
    description: "User activation status",
    example: true,
  })
  @IsBoolean({ message: "Activation status must be a boolean" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @Expose()
  isActive?: boolean;
}
