import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, errors } from '@elastic/elasticsearch';
import { LogResponseDto } from '../logs/dto/log-response.dto';

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
  private readonly indexAlias: string;
  private readonly ilmPolicyName: string;
  private readonly indexTemplateName: string;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('ELASTICSEARCH_NODE');
    const indexAlias = this.configService.get<string>('ELASTICSEARCH_INDEX') ?? 'logs';
    const policyName =
      this.configService.get<string>('ELASTICSEARCH_ILM_POLICY') ?? 'logs-ilm-policy';

    if (!node) {
      throw new Error('ELASTICSEARCH_NODE is not defined in environment variables');
    }

    this.client = new Client({ node });
    this.indexAlias = indexAlias;
    this.ilmPolicyName = policyName;
    this.indexTemplateName = `${this.indexAlias}-template`;
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

  /**
   * Ensure ILM policy, index template and initial index/alias exist.
   * This should be called on application startup.
   */
  async ensureIndex(): Promise<void> {
    await this.ensureIlmPolicy();
    await this.ensureIndexTemplate();
    await this.ensureInitialIndexAndAlias();
  }

  // Ensure that ILM policy exists
  private async ensureIlmPolicy(): Promise<void> {
    try {
      await this.client.ilm.getLifecycle({ name: this.ilmPolicyName });
      this.logger.log(`ILM policy already exists: ${this.ilmPolicyName}`);
    } catch (error) {
      if (error instanceof errors.ResponseError && error.statusCode === 404) {
        this.logger.log(`Creating ILM policy: ${this.ilmPolicyName}`);

        await this.client.ilm.putLifecycle({
          name: this.ilmPolicyName,
          policy: {
            phases: {
              hot: {
                actions: {
                  rollover: {
                    max_age: '7d',
                    max_size: '50gb',
                  },
                },
              },
              delete: {
                min_age: '30d',
                actions: {
                  delete: {},
                },
              },
            },
          },
        });
      } else {
        throw error;
      }
    }
  }

  // Ensure index template for all "logs-*" indices exists
  private async ensureIndexTemplate(): Promise<void> {
    const exists = await this.client.indices.existsIndexTemplate({
      name: this.indexTemplateName,
    });

    if (exists) {
      this.logger.log(`Index template already exists: ${this.indexTemplateName}`);
      return;
    }

    this.logger.log(`Creating index template: ${this.indexTemplateName}`);

    await this.client.indices.putIndexTemplate({
      name: this.indexTemplateName,
      index_patterns: [`${this.indexAlias}-*`],
      template: {
        settings: {
          'index.lifecycle.name': this.ilmPolicyName,
          'index.lifecycle.rollover_alias': this.indexAlias,
          number_of_shards: 1,
          number_of_replicas: 0,
        },
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
      },
      priority: 500,
    });
  }

  private async ensureInitialIndexAndAlias(): Promise<void> {
    // 1) Check if alias already exists
    const aliasExists = await this.client.indices.existsAlias({
      name: this.indexAlias,
    });

    if (aliasExists) {
      this.logger.log(`Alias already exists: ${this.indexAlias}`);
      return;
    }

    const indexWithAliasNameExists = await this.client.indices.exists({
      index: this.indexAlias,
    });

    if (indexWithAliasNameExists) {
      this.logger.warn(
        `Found an existing index with the same name as the alias: ${this.indexAlias}. ` +
          'Skipping creation of initial index and alias. ' +
          'The existing index will be used as the write index. ' +
          'If you want to use ILM rollover with aliases, consider renaming or reindexing this index.',
      );
      return;
    }
    const initialIndexName = `${this.indexAlias}-000001`;
    this.logger.log(`Creating initial index ${initialIndexName} with alias ${this.indexAlias}`);

    await this.client.indices.create({
      index: initialIndexName,
      aliases: {
        [this.indexAlias]: {
          is_write_index: true,
        },
      },
    });
  }

  // Index a single log document in Elasticsearch (using alias)
  async indexLog(log: LogResponseDto): Promise<void> {
    this.logger.log(`Indexing log in ES: ${JSON.stringify(log)}`);

    await this.client.index({
      index: this.indexAlias, // alias, not physical index
      id: log.id,
      document: log,
    });
    await this.client.indices.refresh({ index: this.indexAlias });
  }

  // Search logs using filters and pagination (via alias)
  async searchLogs(params: SearchLogsParams): Promise<{
    data: LogResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { serviceName, level, startDate, endDate, page, pageSize } = params;
    const from = (page - 1) * pageSize;

    const filter: object[] = [];

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
        range['gte'] = startDate;
      }

      if (endDate) {
        range['lte'] = endDate;
      }

      filter.push({
        range: {
          timestamp: range,
        },
      });
    }

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
      index: this.indexAlias,
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

  // Helper for old "searchAllLogs" usage, now using searchLogs
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
