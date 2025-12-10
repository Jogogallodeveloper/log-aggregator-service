import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiProperty({
    description: 'Service that generated this log',
    example: 'auth-service',
  })
  serviceName: string;

  @ApiProperty({
    description: 'Log level (INFO, WARN, ERROR, DEBUG, etc.)',
    example: 'ERROR',
  })
  level: string;

  @ApiProperty({
    description: 'Human-readable log message',
    example: 'Login failed for user john.doe',
  })
  message: string;

  @ApiProperty({
    description: 'Request correlation ID to trace calls across services',
    example: 'req-123456',
  })
  requestId: string;

  @ApiProperty({
    description: 'Additional structured context for debugging and tracing',
    example: { userId: 42, ip: '192.168.0.10' },
  })
  context: Record<string, unknown>;
}
