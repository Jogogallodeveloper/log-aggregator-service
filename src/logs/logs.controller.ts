import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { PaginatedLogsResponseDto } from './dto/paginated-logs-response.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('logs')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({
    summary: 'Ingest a new log entry',
    description:
      'Creates a new log document and stores it in Elasticsearch. Requires a valid API key.',
  })
  @ApiCreatedResponse({
    description: 'Log entry successfully created',
    type: LogResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload validation failed',
  })
  async create(@Body() createLogDto: CreateLogDto): Promise<LogResponseDto> {
    return this.logsService.create(createLogDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Search logs with filters and pagination',
    description:
      'Returns a paginated list of logs filtered by service name, level and optional date range.',
  })
  @ApiOkResponse({
    description: 'Paginated list of logs',
    type: PaginatedLogsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Page size (items per page)',
    example: 20,
  })
  @ApiQuery({
    name: 'serviceName',
    required: false,
    description: 'Filter by service name',
    example: 'auth-service',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Filter by log level',
    example: 'ERROR',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description:
      'Start of date range filter (inclusive) in ISO8601 format. Example: 2025-12-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description:
      'End of date range filter (inclusive) in ISO8601 format. Example: 2025-12-11T23:59:59.999Z',
  })
  async findAll(@Query() query: GetLogsQueryDto): Promise<PaginatedLogsResponseDto> {
    return this.logsService.findAll(query);
  }
}
