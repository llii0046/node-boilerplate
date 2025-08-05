import { ApiProperty } from "@/modules/shared/swagger/decorators";

export class ErrorResponseDto {
  @ApiProperty({
    description: "Error code",
    example: "NOT_FOUND",
    required: true,
  })
  error!: string;

  @ApiProperty({
    description: "Error message",
    example: "Resource not found",
    required: true,
  })
  message!: string;

  @ApiProperty({
    description: "Error details (optional)",
    example: [],
    required: false,
  })
  details?: unknown[];
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: "Validation error details",
    example: [
      {
        field: "email",
        message: "Email is required",
        value: "",
      },
    ],
    required: true,
  })
  declare details: unknown[];
}

export class ConflictErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: "Conflict error code",
    example: "EMAIL_EXISTS",
    required: true,
  })
  declare error: string;
}
