// src/logs/dto/paginated-logs-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { LogResponseDto } from './log-response.dto';

export class PaginatedLogsResponseDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total number of logs that match the filters' })
  total: number;

  @ApiProperty({ type: () => [LogResponseDto], description: 'List of logs for the current page' })
  data: LogResponseDto[];
}
