// src/logs/dto/get-logs-query.dto.ts
import { IsOptional, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLogsQueryDto {
  // Optional filter by service name (e.g. "auth-service")
  @IsOptional()
  @IsString()
  serviceName?: string;

  // Optional filter by log level (e.g. "ERROR", "INFO")
  @IsOptional()
  @IsString()
  level?: string;

  // Optional start date (ISO string)
  @IsOptional()
  @IsDateString()
  startDate?: string;

  // Optional end date (ISO string)
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Page number for pagination (default 1)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Page size for pagination (default 20, max 100)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
