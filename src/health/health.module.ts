import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [
    // Import ElasticModule to be able to inject ElasticService
    ElasticModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
