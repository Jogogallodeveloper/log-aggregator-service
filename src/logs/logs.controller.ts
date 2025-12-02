import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  findAll() {
    // call service to fetch logs
    return this.logsService.findAll();
  }

  @Post()
  create(@Body() body: CreateLogDto) {
    // call service to create a new log entry
    return this.logsService.create(body);
  }
}
