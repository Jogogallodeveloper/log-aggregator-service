import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateLogDto {
  @ApiProperty({
    description: 'Service name that produced the log',
    example: 'auth-service',
  })
  @IsString()
  serviceName: string;

  @ApiProperty({
    description: 'Log level (severity)',
    example: 'ERROR',
  })
  @IsString()
  level: string;

  @ApiProperty({
    description: 'Human readable log message',
    example: 'User login failed',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Unique request identifier used for tracing',
    example: 'req-001',
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Optional context object with structured data',
    example: { userId: 10, ip: '127.0.0.1' },
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Optional timestamp in ISO8601 format. If omitted, server will set current time.',
    example: '2025-12-11T18:40:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
