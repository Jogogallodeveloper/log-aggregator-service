export class LogResponseDto {
  id: string;
  timestamp: string;
  serviceName: string;
  level: string;
  message: string;
  context?: any;
  requestId?: string;
}
