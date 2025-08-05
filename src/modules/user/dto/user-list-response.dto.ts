import { IsInt } from "class-validator";
import { Expose } from "class-transformer";
import { ApiProperty } from "@/modules/shared/swagger/decorators";
import { UserResponseDto } from "./user-response.dto";

/**
 * User list response DTO
 */
export class UserListResponseDto {
  @ApiProperty({
    description: "User list",
    type: "array",
    items: { type: "object" },
  })
  @Expose()
  data!: UserResponseDto[];

  @ApiProperty({
    description: "Total count",
    example: 100,
  })
  @IsInt({ message: "Total count must be an integer" })
  @Expose()
  total!: number;

  @ApiProperty({
    description: "Current page",
    example: 1,
  })
  @IsInt({ message: "Page number must be an integer" })
  @Expose()
  page!: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
  })
  @IsInt({ message: "Items per page must be an integer" })
  @Expose()
  limit!: number;
}
