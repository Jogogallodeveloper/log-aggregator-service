import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiQuery,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { PaginatedLogsResponseDto } from './dto/paginated-logs-response.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('logs')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log entry' })
  @ApiBody({ type: CreateLogDto })
  @ApiOkResponse({
    description: 'Log successfully created',
    type: LogResponseDto,
  })
  async create(@Body() createLogDto: CreateLogDto): Promise<LogResponseDto> {
    return this.logsService.create(createLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'List logs with optional filters and pagination' })
  @ApiQuery({ name: 'serviceName', required: false, description: 'Filter by service' })
  @ApiQuery({ name: 'level', required: false, description: 'Filter by log level' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Items per page (default 20, max 100)',
  })
  @ApiOkResponse({
    description: 'Paginated list of logs',
    type: PaginatedLogsResponseDto,
  })
  async findAll(@Query() query: GetLogsQueryDto): Promise<PaginatedLogsResponseDto> {
    return this.logsService.findAll(query);
  }
}
