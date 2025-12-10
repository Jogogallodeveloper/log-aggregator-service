import { ApiProperty } from '@nestjs/swagger';

export class LogResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the log entry',
    example: 'a8b0fddf-2284-4b32-8c79-b9e3b8751dc1',
  })
  id: string;

  @ApiProperty({
    description: 'Timestamp when the log was created (ISO 8601)',
    example: '2025-12-08T20:24:43.523Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Service that generated this log',
    example: 'auth-service',
  })
  serviceName: string;

  @ApiProperty({
    description: 'Log level',
    example: 'ERROR',
  })
  level: string;

  @ApiProperty({
    description: 'Human-readable log message',
    example: 'Login failed for user john.doe',
  })
  message: string;

  @ApiProperty({
    description: 'Request correlation ID',
    example: 'req-123456',
  })
  requestId: string;

  @ApiProperty({
    description: 'Additional structured context information',
    example: { userId: 42, ip: '192.168.0.10' },
  })
  context: Record<string, unknown>;
}
