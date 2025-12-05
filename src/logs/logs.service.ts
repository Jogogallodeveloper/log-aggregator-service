import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { randomUUID } from 'crypto';
import { ElasticService } from '../elastic/elastic.service';

@Injectable()
export class LogsService {
  // In-memory log storage (temporary, for debug)
  private logs: LogResponseDto[] = [];

  constructor(private readonly elasticService: ElasticService) {}

  // Returns all logs from Elasticsearch
  async findAll(): Promise<LogResponseDto[]> {
    // Main source of truth: Elasticsearch
    return this.elasticService.searchAllLogs();
  }

  // Creates a new log entry and sends it to Elasticsearch
  async create(dto: CreateLogDto): Promise<LogResponseDto> {
    const log: LogResponseDto = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...dto,
    };

    console.log('Creating log and sending to ES:', log);

    // Keep local copy in memory for debugging if needed
    this.logs.push(log);

    // Persist log document in Elasticsearch
    await this.elasticService.indexLog(log);

    return log;
  }
}
