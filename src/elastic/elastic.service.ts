import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { LogResponseDto } from '../logs/dto/log-response.dto';

// Parameters used to search logs with filters and pagination
interface SearchLogsParams {
  serviceName?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class ElasticService {
  private readonly logger = new Logger(ElasticService.name);
  private readonly client: Client;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('ELASTICSEARCH_NODE');
    const index = this.configService.get<string>('ELASTICSEARCH_INDEX') ?? 'logs';

    if (!node) {
      throw new Error('ELASTICSEARCH_NODE is not defined in environment variables');
    }

    this.client = new Client({ node });
    this.indexName = index;
  }

  // Simple health check method
  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      this.logger.log('Elasticsearch is reachable');
      return true;
    } catch (error) {
      this.logger.error('Elasticsearch ping failed', error as Error);
      return false;
    }
  }

  // Ensure that the index exists with the correct mapping
  async ensureIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: this.indexName });

    // Depending on ES client version, "exists" may be boolean or response object.
    // Adjust here if necessary.
    if (!exists) {
      this.logger.log(`Creating index: ${this.indexName}`);

      await this.client.indices.create({
        index: this.indexName,
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            serviceName: { type: 'keyword' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            requestId: { type: 'keyword' },
            context: { type: 'object', enabled: true },
          },
        },
      });
    } else {
      this.logger.log(`Index already exists: ${this.indexName}`);
    }
  }

  // Index a single log document in Elasticsearch
  async indexLog(log: LogResponseDto): Promise<void> {
    this.logger.log(`Indexing log in ES: ${JSON.stringify(log)}`);
    await this.client.index({
      index: this.indexName,
      id: log.id,
      document: log,
    });

    // Refresh index for immediate visibility in dev environment
    await this.client.indices.refresh({ index: this.indexName });
  }

  // Search logs using filters and pagination
  // This is the main method that the service/controller will consume
  async searchLogs(params: SearchLogsParams): Promise<{
    data: LogResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { serviceName, level, startDate, endDate, page, pageSize } = params;

    // Calculate "from" for pagination
    const from = (page - 1) * pageSize;

    // Build filter conditions
    const filter: any[] = [];

    if (serviceName) {
      filter.push({
        term: {
          serviceName: serviceName,
        },
      });
    }

    if (level) {
      filter.push({
        term: {
          level: level,
        },
      });
    }

    if (startDate || endDate) {
      const range: Record<string, string> = {};
      if (startDate) {
        range.gte = startDate;
      }
      if (endDate) {
        range.lte = endDate;
      }

      filter.push({
        range: {
          timestamp: range,
        },
      });
    }

    // If there are filters, use bool/filter, otherwise match_all
    const query =
      filter.length > 0
        ? {
            bool: {
              filter,
            },
          }
        : {
            match_all: {},
          };

    this.logger.debug(
      `Searching logs with params: ${JSON.stringify({
        serviceName,
        level,
        startDate,
        endDate,
        page,
        pageSize,
      })}`,
    );

    const response = await this.client.search<LogResponseDto>({
      index: this.indexName,
      from,
      size: pageSize,
      sort: [{ timestamp: { order: 'desc' } }],
      query,
    });

    const hits = response.hits.hits ?? [];

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const data = hits
      .map((hit) => hit._source)
      .filter((doc): doc is LogResponseDto => doc !== undefined);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // Legacy/simple method kept for backward compatibility
  // Now it just calls searchLogs with default pagination and no filters
  async searchAllLogs(): Promise<LogResponseDto[]> {
    const result = await this.searchLogs({
      serviceName: undefined,
      level: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      pageSize: 100,
    });

    return result.data;
  }
}
