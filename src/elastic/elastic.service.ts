import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { LogResponseDto } from '../logs/dto/log-response.dto';

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

  // Search all logs (later we will add filters and pagination)
  async searchAllLogs(): Promise<LogResponseDto[]> {
    const response = await this.client.search<LogResponseDto>({
      index: this.indexName,
      size: 100,
      sort: [{ timestamp: { order: 'desc' } }],
      query: {
        match_all: {},
      },
    });

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((doc): doc is LogResponseDto => doc !== undefined);
  }
}
