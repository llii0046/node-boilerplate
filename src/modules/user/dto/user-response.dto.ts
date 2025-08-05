import { IsEmail, IsString, IsOptional, IsBoolean, IsUUID } from "class-validator";
import { Expose } from "class-transformer";
import { ApiProperty } from "@/modules/shared/swagger/decorators";
import { TimestampDto } from "@/shares/dto";
import { Prisma } from "@prisma/client";

// Custom type for user response (excludes password and other sensitive fields)
// Note: createdAt and updatedAt are handled by TimestampDto as strings
type UserResponse = Pick<Prisma.UserGetPayload<{}>, 'id' | 'email' | 'name' | 'isActive'>;

/**
 * User response DTO - Pick specific fields from Prisma User type
 */
export class UserResponseDto extends TimestampDto implements UserResponse {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID(4, { message: "User ID format is incorrect" })
  @Expose()
  id!: string;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Email format is incorrect" })
  @Expose()
  email!: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
  })
  @IsString({ message: "Name must be a string" })
  @IsOptional()
  @Expose()
  name!: string | null;

  @ApiProperty({
    description: "User activation status",
    example: true,
  })
  @IsBoolean({ message: "Activation status must be a boolean" })
  @Expose()
  isActive!: boolean;
}
