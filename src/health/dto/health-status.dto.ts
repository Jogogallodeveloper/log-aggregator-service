// src/health/dto/health-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class HealthStatusDto {
  @ApiProperty({
    description: 'Overall status of the API',
    example: 'ok',
  })
  status: 'ok' | 'degraded';

  @ApiProperty({
    description: 'Elasticsearch connection status',
    example: 'up',
  })
  elasticsearch: 'up' | 'down';

  @ApiProperty({
    description: 'ISO timestamp of the health check',
    example: '2025-12-10T20:30:00.000Z',
  })
  timestamp: string;
}
