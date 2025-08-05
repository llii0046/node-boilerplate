import { ApiProperty } from "@/modules/shared/swagger/decorators/api-property.decorator";
import { Expose } from "class-transformer";

export class TimestampDto {
  @ApiProperty({
    description: "Created time",
    example: "2023-01-01T00:00:00.000Z",
    format: "date-time",
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: "Updated time",
    example: "2023-01-01T00:00:00.000Z",
    format: "date-time",
  })
  @Expose()
  updatedAt!: Date;
}
