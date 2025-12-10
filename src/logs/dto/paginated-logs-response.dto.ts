import { ApiProperty } from '@nestjs/swagger';
import { LogResponseDto } from './log-response.dto';

export class PaginatedLogsResponseDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  pageSize: number;

  @ApiProperty({
    description: 'Total number of log entries that match the filters',
    example: 125,
  })
  total: number;

  @ApiProperty({
    description: 'List of logs for the current page',
    type: [LogResponseDto],
  })
  data: LogResponseDto[];
}
