import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogsModule } from './logs/logs.module';
import { ElasticModule } from './elastic/elastic.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make config available everywhere
    }),
    ElasticModule,
    LogsModule,
    HealthModule, // Health endpoint module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
