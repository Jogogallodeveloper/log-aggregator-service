import { ApiProperty } from '@nestjs/swagger';
import { LogResponseDto } from './log-response.dto';

export class PaginatedLogsResponseDto {
  @ApiProperty({
    description: 'List of logs for the current page',
    type: [LogResponseDto],
  })
  data: LogResponseDto[];

  @ApiProperty({
    description: 'Total number of logs matching the filters',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-based)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  pageSize: number;
}
