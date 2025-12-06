// src/logs/logs.controller.ts
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiQuery,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PaginatedLogsResponseDto } from './dto/paginated-logs-response.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@ApiTags('logs')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log entry' })
  @ApiBody({ type: CreateLogDto })
  async create(@Body() createLogDto: CreateLogDto): Promise<LogResponseDto> {
    return this.logsService.create(createLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'List logs with optional filters and pagination' })
  @ApiQuery({ name: 'serviceName', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO date string' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default 1)' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Items per page (default 20, max 100)',
  })
  @ApiOkResponse({ type: PaginatedLogsResponseDto })
  async findAll(@Query() query: GetLogsQueryDto): Promise<PaginatedLogsResponseDto> {
    return this.logsService.findAll(query);
  }
}
