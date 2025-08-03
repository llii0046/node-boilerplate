import { Request, Response } from "express";
import {
  ControllerBase,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  Get,
  ApiProperty,
} from "@/modules/shared/swagger";
import { checkDatabase } from "@/utils/startup.js";

export class HealthResponseDto {
  @ApiProperty({
    description: "Service status",
    example: true,
  })
  ok!: boolean;

  @ApiProperty({
    description: "Uptime (seconds)",
    example: 1234.56,
  })
  uptime!: number;

  @ApiProperty({
    description: "Timestamp",
    example: "2023-01-01T00:00:00.000Z",
    format: "date-time",
  })
  timestamp!: string;

  @ApiProperty({
    description: "Database status",
    type: "object",
  })
  database!: {
    status: string;
    message: string;
  };
}

@ApiTags("Health")
export class HealthController extends ControllerBase {
  constructor() {
    super();
  }

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Check API service status and database connection",
  })
  @ApiOkResponse({
    description: "Service healthy",
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: "Service unhealthy",
  })
  async healthCheck(_req: Request, res: Response) {
    try {
      const dbCheck = await checkDatabase();
      const healthStatus = {
        ok: dbCheck.ok,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: dbCheck.ok ? "connected" : "disconnected",
          message: dbCheck.message,
        },
      };

      res.status(dbCheck.ok ? 200 : 503).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        ok: false,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          message: "Database check failed",
        },
      });
    }
  }
}
