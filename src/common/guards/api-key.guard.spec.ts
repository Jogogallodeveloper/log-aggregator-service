/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ApiKeyGuard } from './api-key.guard';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Helper to build a mock HTTP ExecutionContext
function createMockExecutionContext(headers: Record<string, string>): ExecutionContext {
  const request = {
    headers,
    // Express-like "header" function
    header: (name: string) => {
      const lower = name.toLowerCase();

      const normalizedHeaders = Object.keys(headers).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = headers[key];
        return acc;
      }, {});

      return normalizedHeaders[lower];
    },
  };

  const httpContext = {
    getRequest: () => request,
    getResponse: () => ({}),
    getNext: () => ({}),
  };

  const context = {
    switchToHttp: () => httpContext,
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getArgByIndex: () => undefined,
    getArgs: () => [],
    getClass: () => class Dummy {},
    getHandler: () =>
      function handler() {
        // no-op
      },
    getType: () => 'http',
  };

  return context as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: ConfigService;

  beforeEach(() => {
    // Mock only the "get" method that the guard uses
    const mockConfig: Pick<ConfigService, 'get'> = {
      get: (key: string) => {
        if (key === 'API_KEY') {
          return 'valid-key';
        }
        return null;
      },
    };

    configService = mockConfig as ConfigService;
    guard = new ApiKeyGuard(configService);
  });

  it('should allow request with valid api key', () => {
    const context = createMockExecutionContext({ 'x-api-key': 'valid-key' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw for invalid api key', () => {
    const context = createMockExecutionContext({ 'x-api-key': 'wrong-key' });

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should throw when api key header is missing', () => {
    const context = createMockExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow();
  });
});
