// src/health/health.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { ElasticService } from '../elastic/elastic.service';
import { HealthStatusDto } from './dto/health-status.dto';

describe('HealthController', () => {
  let controller: HealthController;

  // Strongly typed mock for ElasticService.ping()
  const mockElasticService: Partial<ElasticService> & {
    ping: jest.Mock<Promise<boolean>, []>;
  } = {
    ping: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ElasticService,
          useValue: mockElasticService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('should return ok / up when Elasticsearch ping succeeds', async () => {
    mockElasticService.ping.mockResolvedValue(true);

    const result: HealthStatusDto = await controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.elasticsearch).toBe('up');
    expect(typeof result.timestamp).toBe('string');
  });

  it('should return degraded / down when Elasticsearch ping fails', async () => {
    mockElasticService.ping.mockResolvedValue(false);

    const result: HealthStatusDto = await controller.getHealth();

    expect(result.status).toBe('degraded');
    expect(result.elasticsearch).toBe('down');
    //verify timestamp is always present and valid ISO 8601
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
