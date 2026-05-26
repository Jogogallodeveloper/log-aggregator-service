import { Test } from '@nestjs/testing';
import { ElasticService } from './elastic.service';
import { ConfigService } from '@nestjs/config';
import { LogResponseDto } from '../logs/dto/log-response.dto';
import { errors } from '@elastic/elasticsearch';

const mockClient = {
  ping: jest.fn(),
  index: jest.fn(),
  search: jest.fn(),
  indices: {
    refresh: jest.fn(),
    existsIndexTemplate: jest.fn(),
    putIndexTemplate: jest.fn(),
    existsAlias: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
  },
  ilm: {
    getLifecycle: jest.fn(),
    putLifecycle: jest.fn(),
  },
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

    jest.clearAllMocks();
  });

  it('should return true when ping succeeds', async () => {
    //ARRANGE
    mockClient.ping.mockResolvedValue(true);

    //ACT
    const result = await service.ping();

    //ASSERT
    expect(result).toBe(true);
    expect(mockClient.ping).toHaveBeenCalledTimes(1);
  });

  it('should return false when ping fails', async () => {
    //ARRANGE
    mockClient.ping.mockRejectedValue(new Error('Connection refused'));

    //ACT
    const result = await service.ping();

    //ASSERT
    expect(result).toBe(false);
    expect(mockClient.ping).toHaveBeenCalledTimes(1);
  });

  it('should skip creation when all resources already exists', async () => {
    //ARRANGE
    mockClient.ilm.getLifecycle.mockResolvedValue({});
    mockClient.indices.existsIndexTemplate.mockResolvedValue(true);
    mockClient.indices.existsAlias.mockResolvedValue(true);

    //ACT
    await service.ensureIndex();

    //ASSERT - no create/put methods should be called
    expect(mockClient.ilm.putLifecycle).not.toHaveBeenCalled();
    expect(mockClient.indices.putIndexTemplate).not.toHaveBeenCalled();
    expect(mockClient.indices.create).not.toHaveBeenCalled();
  });

  it('should create all resources when starting from scratch', async () => {
    // ARRANGE — simulate nothing exists yet
    mockClient.ilm.getLifecycle.mockRejectedValue(
      new errors.ResponseError({
        statusCode: 404,
        body: {},
        headers: {},
        warnings: null,
        meta: {} as never,
      }),
    );
    mockClient.ilm.putLifecycle.mockResolvedValue({});
    mockClient.indices.existsIndexTemplate.mockResolvedValue(false);
    mockClient.indices.putIndexTemplate.mockResolvedValue({});
    mockClient.indices.existsAlias.mockResolvedValue(false);
    mockClient.indices.exists.mockResolvedValue(false);
    mockClient.indices.create.mockResolvedValue({});

    // ACT
    await service.ensureIndex();

    // ASSERT — all create/put methods must have been called
    expect(mockClient.ilm.putLifecycle).toHaveBeenCalledTimes(1);
    expect(mockClient.indices.putIndexTemplate).toHaveBeenCalledTimes(1);
    expect(mockClient.indices.create).toHaveBeenCalledTimes(1);
    expect(mockClient.indices.create).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 'logs-000001',
      }),
    );
  });

  it('should rethrow error when ILM returns unexpected error', async () => {
    // ARRANGE — simulate a 500 error from ILM
    mockClient.ilm.getLifecycle.mockRejectedValue(
      new errors.ResponseError({
        statusCode: 500,
        body: {},
        headers: {},
        warnings: null,
        meta: {} as never,
      }),
    );

    // ACT & ASSERT — error must propagate, not be swallowed
    await expect(service.ensureIndex()).rejects.toThrow();
  });

  it('should skip index creation when index with alias name already exists', async () => {
    // ARRANGE
    mockClient.ilm.getLifecycle.mockResolvedValue({});
    mockClient.indices.existsIndexTemplate.mockResolvedValue(true);
    mockClient.indices.existsAlias.mockResolvedValue(false);
    mockClient.indices.exists.mockResolvedValue(true);

    // ACT
    await service.ensureIndex();

    // ASSERT — create must NOT be called
    expect(mockClient.indices.create).not.toHaveBeenCalled();
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
