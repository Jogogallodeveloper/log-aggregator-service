import { Module, OnModuleInit } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { ElasticModule } from '../elastic/elastic.module';
import { ElasticService } from '../elastic/elastic.service';

@Module({
  imports: [ElasticModule],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule implements OnModuleInit {
  constructor(private readonly elasticService: ElasticService) {}

  async onModuleInit(): Promise<void> {
    await this.elasticService.ping();
    await this.elasticService.ensureIndex();
  }
}
