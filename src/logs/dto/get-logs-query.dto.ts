import { IsOptional, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by service name',
    example: 'auth-service',
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiPropertyOptional({
    description: 'Filter by log level',
    example: 'ERROR',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    description: 'Start date (inclusive) in ISO 8601 format',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (inclusive) in ISO 8601 format',
    example: '2025-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts at 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
