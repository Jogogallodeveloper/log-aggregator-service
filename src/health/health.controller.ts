import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ElasticService } from '../elastic/elastic.service';
import { HealthStatusDto } from './dto/health-status.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly elasticService: ElasticService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check for the API and Elasticsearch connection',
  })
  @ApiOkResponse({
    description: 'Health status payload',
    type: HealthStatusDto,
  })
  async getHealth(): Promise<HealthStatusDto> {
    // Call Elasticsearch ping to verify connectivity
    const elasticOk = await this.elasticService.ping();

    return {
      status: elasticOk ? 'ok' : 'degraded',
      elasticsearch: elasticOk ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
