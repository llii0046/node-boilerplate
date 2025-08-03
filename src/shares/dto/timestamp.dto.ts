import { ApiProperty } from "@/modules/shared/swagger/decorators/api-property.decorator";
import { Expose } from "class-transformer";
import { IsDateString } from "class-validator";

export class TimestampDto {
  @ApiProperty({
    description: "Created time",
    example: "2023-01-01T00:00:00.000Z",
    format: "date-time",
  })
  @IsDateString({}, { message: "Created time format is incorrect" })
  @Expose()
  createdAt!: string;

  @ApiProperty({
    description: "Updated time",
    example: "2023-01-01T00:00:00.000Z",
    format: "date-time",
  })
  @IsDateString({}, { message: "Updated time format is incorrect" })
  @Expose()
  updatedAt!: string;
}
