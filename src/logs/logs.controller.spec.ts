import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';
import { PaginatedLogsResponseDto } from './dto/paginated-logs-response.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

describe('LogsController', () => {
  let controller: LogsController;

  const mockLogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  // Mock guard that always allows the request
  const mockApiKeyGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: LogsService,
          useValue: mockLogsService,
        },
      ],
    })
      // Here we override the real ApiKeyGuard used by @UseGuards
      .overrideGuard(ApiKeyGuard)
      .useValue(mockApiKeyGuard)
      .compile();

    controller = module.get<LogsController>(LogsController);

    jest.clearAllMocks();
  });

  it('should call LogsService.create() when POST /logs is called', async () => {
    const dto: CreateLogDto = {
      serviceName: 'auth-service',
      level: 'ERROR',
      message: 'Testing',
      requestId: 'req-123',
      context: {},
    };

    mockLogsService.create.mockResolvedValue({
      ...dto,
      id: 'generated-id',
      timestamp: new Date().toISOString(),
    });

    const result = await controller.create(dto);

    expect(mockLogsService.create).toHaveBeenCalledTimes(1);
    expect(mockLogsService.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id');
  });

  it('should call LogsService.findAll() when GET /logs is called', async () => {
    const query: GetLogsQueryDto = { page: 1, pageSize: 10 };

    const fakeResponse: PaginatedLogsResponseDto = {
      page: 1,
      pageSize: 10,
      total: 1,
      data: [],
    };

    mockLogsService.findAll.mockResolvedValue(fakeResponse);

    const result = await controller.findAll(query);

    expect(mockLogsService.findAll).toHaveBeenCalledTimes(1);
    expect(mockLogsService.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(fakeResponse);
  });
});
