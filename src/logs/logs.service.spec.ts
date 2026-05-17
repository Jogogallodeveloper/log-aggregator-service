/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { LogsService } from './logs.service';
import { ElasticService } from '../elastic/elastic.service';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';

describe('LogsService', () => {
  let service: LogsService;
  let elasticService: ElasticService;

  const mockElasticService = {
    indexLog: jest.fn(),
    searchLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsService, { provide: ElasticService, useValue: mockElasticService }],
    }).compile();

    service = module.get<LogsService>(LogsService);
    elasticService = module.get<ElasticService>(ElasticService);

    jest.clearAllMocks();
  });

  it('should index a log using ElasticService', async () => {
    // We do not need specific fields here,
    // we just want to verify that LogsService builds a log object
    // (with id and timestamp) and forwards it to ElasticService.
    const dto = {} as CreateLogDto;

    const spy = jest.spyOn(elasticService, 'indexLog');

    await service.create(dto);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
    // verify id is a valid UUID v4 and timestamp is ISO 8601
    const calledWith = spy.mock.calls[0][0];
    expect(calledWith.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(calledWith.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should call searchLogs with correct parameters', async () => {
    const query: GetLogsQueryDto = { page: 1, pageSize: 10 };

    const spy = jest.spyOn(elasticService, 'searchLogs');

    mockElasticService.searchLogs.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    const result = await service.findAll(query);

    expect(spy).toHaveBeenCalledTimes(1);
    // verify the exact parameters forwarded to Elasticsearch
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 10 }));
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
  });

  it('should return log with only the fields present in the dto', async () => {
    // ARRANGE
    const dto: CreateLogDto = {
      level: 'error',
      serviceName: 'auth-service',
      message: 'Login failed',
    } as CreateLogDto;

    mockElasticService.indexLog.mockResolvedValue(undefined);

    // ACT
    const result = await service.create(dto);

    // ASSERT
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.level).toBe('error');
    expect(result.serviceName).toBe('auth-service');
    expect(result.message).toBe('Login failed');
    expect(result.requestId).toBeUndefined();
    expect(result.context).toBeUndefined();
  });

  it('should propagate error when indexLog fails', async () => {
    // ARRANGE
    const dto: CreateLogDto = {
      level: 'error',
      serviceName: 'auth-service',
      message: 'Login failed',
    } as CreateLogDto;

    mockElasticService.indexLog.mockRejectedValue(new Error('ES down'));

    // ACT & ASSERT
    await expect(service.create(dto)).rejects.toThrow('ES down');
  });
  it('should apply default page and pageSize when not provided', async () => {
    // ARRANGE
    const query: GetLogsQueryDto = {};

    mockElasticService.searchLogs.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    const spy = jest.spyOn(elasticService, 'searchLogs');

    // ACT
    await service.findAll(query);

    // ASSERT
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
  });

  it('should forward all filters to searchLogs', async () => {
    // ARRANGE
    const query: GetLogsQueryDto = {
      serviceName: 'auth-service',
      level: 'error',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.999Z',
      page: 3,
      pageSize: 50,
    };

    mockElasticService.searchLogs.mockResolvedValue({
      data: [],
      total: 0,
      page: 3,
      pageSize: 50,
    });

    const spy = jest.spyOn(elasticService, 'searchLogs');

    // ACT
    await service.findAll(query);

    // ASSERT
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: 'auth-service',
        level: 'error',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-31T23:59:59.999Z',
        page: 3,
        pageSize: 50,
      }),
    );
  });
  it('should propagate error when searchLogs fails', async () => {
    // ARRANGE
    const query: GetLogsQueryDto = { page: 1, pageSize: 10 };

    mockElasticService.searchLogs.mockRejectedValue(new Error('ES down'));

    // ACT & ASSERT
    await expect(service.findAll(query)).rejects.toThrow('ES down');
  });
});
