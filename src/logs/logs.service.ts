import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { randomUUID } from 'crypto';
import { ElasticService } from '../elastic/elastic.service';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { PaginatedLogsResponseDto } from './dto/paginated-logs-response.dto';

@Injectable()
export class LogsService {
  // In-memory log storage (temporary, for debug)
  private logs: LogResponseDto[] = [];

  constructor(private readonly elasticService: ElasticService) {}

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

  // Find logs with optional filters and pagination
  async findAll(query: GetLogsQueryDto): Promise<PaginatedLogsResponseDto> {
    // Ensure default values
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.elasticService.searchLogs({
      serviceName: query.serviceName,
      level: query.level,
      startDate: query.startDate,
      endDate: query.endDate,
      page,
      pageSize,
    });

    return result;
  }
}
