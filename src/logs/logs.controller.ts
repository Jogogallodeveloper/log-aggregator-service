import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('logs')
@UseGuards(ApiKeyGuard) // protect all log routes with API key
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll(): Promise<LogResponseDto[]> {
    // Delegate to service to retrieve all logs from Elasticsearch
    return this.logsService.findAll();
  }

  @Post()
  async create(@Body() body: CreateLogDto): Promise<LogResponseDto> {
    // Delegate to service to create and index a new log entry
    return this.logsService.create(body);
  }
}
