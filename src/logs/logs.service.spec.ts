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
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
  });
});
