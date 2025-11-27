import { Controller, Get } from '@nestjs/common';

@Controller('logs')
export class LogsController {
  @Get()
  findAll() {
    // simple fake response for first test
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
