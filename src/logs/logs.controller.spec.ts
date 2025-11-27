import { Controller, Get } from '@nestjs/common';

@Controller('logs')
export class LogsController {
  @Get()
  findAll() {
    return [
      {
        id: '1',
        serviceName: 'demo-service',
        level: 'INFO',
        message: 'Log aggregator is alive!',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}
