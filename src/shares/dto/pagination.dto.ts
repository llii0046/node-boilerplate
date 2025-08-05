import { IsInt, Min, Max, IsOptional } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@/modules/shared/swagger/decorators";

/**
 * Generic pagination query DTO
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: "Page number must be an integer" })
  @Min(1, { message: "Page number cannot be less than 1" })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @Expose()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Items per page",
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: "Items per page must be an integer" })
  @Min(1, { message: "Items per page cannot be less than 1" })
  @Max(100, { message: "Items per page cannot exceed 100" })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @Expose()
  limit?: number = 10;
}
