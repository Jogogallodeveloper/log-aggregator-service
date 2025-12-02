import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LogsService {
  // in-memory storage for logs (temporary)
  private logs: LogResponseDto[] = [];

  // returns all logs
  findAll(): LogResponseDto[] {
    return this.logs;
  }

  // creates a new log entry
  create(dto: CreateLogDto): LogResponseDto {
    const log: LogResponseDto = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...dto,
    };

    this.logs.push(log);

    return log;
  }
}
