import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // Get HTTP request from execution context
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();

    // Read API key from request header
    const apiKeyFromHeader = request.header('x-api-key');

    if (!apiKeyFromHeader) {
      // Reject if header is missing
      throw new UnauthorizedException('API key is missing');
    }

    // Expected API key from environment variables
    const expectedApiKey = this.configService.get<string>('API_KEY');

    if (!expectedApiKey || apiKeyFromHeader !== expectedApiKey) {
      // Reject if API key does not match
      throw new UnauthorizedException('Invalid API key');
    }

    // Access allowed
    return true;
  }
}
