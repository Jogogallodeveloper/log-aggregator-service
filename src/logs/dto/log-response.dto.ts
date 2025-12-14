// src/logs/dto/log-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LogResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the log document',
    example: '23b067a5-779b-4b93-b86f-d847f3a3ff0a',
  })
  id: string;

  @ApiProperty({
    description: 'Timestamp when the log was created',
    example: '2025-12-11T18:40:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Service name that produced the log',
    example: 'auth-service',
  })
  serviceName: string;

  @ApiProperty({
    description: 'Log level',
    example: 'ERROR',
  })
  level: string;

  @ApiProperty({
    description: 'Human readable log message',
    example: 'User login failed',
  })
  message: string;

  @ApiProperty({
    description: 'Unique request identifier for tracing',
    example: 'req-001',
    required: false,
  })
  requestId?: string;

  @ApiProperty({
    description: 'Structured context payload associated with the log',
    example: { userId: 10, ip: '127.0.0.1' },
    required: false,
  })
  context?: Record<string, unknown>;
}
