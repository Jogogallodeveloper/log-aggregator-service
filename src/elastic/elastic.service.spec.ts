import { Test } from '@nestjs/testing';
import { ElasticService } from './elastic.service';
import { ConfigService } from '@nestjs/config';
import { LogResponseDto } from '../logs/dto/log-response.dto';

const mockClient = {
  index: jest.fn(),
  ping: jest.fn(),
  indices: {
    exists: jest.fn(),
    create: jest.fn(),
    refresh: jest.fn(),
  },
  search: jest.fn(),
};

describe('ElasticService', () => {
  let service: ElasticService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ElasticService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'ELASTICSEARCH_NODE') return 'http://localhost:9200';
              if (key === 'ELASTICSEARCH_INDEX') return 'logs';
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<ElasticService>(ElasticService);

    // Override Elasticsearch client with mock
    (service as unknown as { client: typeof mockClient }).client = mockClient;
  });

  it('should call client.index when indexing log', async () => {
    const dto: LogResponseDto = {
      id: '1',
      timestamp: new Date().toISOString(),
      serviceName: 'test-service',
      level: 'INFO',
      message: 'test',
      requestId: 'req-123',
      context: {},
    };

    await service.indexLog(dto);

    expect(mockClient.index).toHaveBeenCalled();
  });
});
