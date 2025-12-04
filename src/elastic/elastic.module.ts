import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticService } from './elastic.service';

@Module({
  imports: [ConfigModule],
  providers: [ElasticService],
  exports: [ElasticService], // allow other modules to inject this service
})
export class ElasticModule {}
