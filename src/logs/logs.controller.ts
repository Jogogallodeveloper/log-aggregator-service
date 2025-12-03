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
  findAll(): LogResponseDto[] {
    // Delegate to service to retrieve all logs
    return this.logsService.findAll();
  }

  @Post()
  create(@Body() body: CreateLogDto): LogResponseDto {
    // Delegate to service to create a new log entry
    return this.logsService.create(body);
  }
}
