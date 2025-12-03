import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LogsService {
  // In-memory log storage (temporary)
  private logs: LogResponseDto[] = [];

  // Returns all logs
  findAll(): LogResponseDto[] {
    return this.logs;
  }

  // Creates a new log entry
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
