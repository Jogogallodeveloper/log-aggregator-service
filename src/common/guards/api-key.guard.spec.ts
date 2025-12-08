import { ApiKeyGuard } from './api-key.guard';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Helper to build a mock ExecutionContext for HTTP requests
function createMockExecutionContext(headers: Record<string, string>): ExecutionContext {
  const httpContext = {
    // Only "headers" are relevant for this guard
    getRequest: () => ({ headers }),
    // These methods are required by the interface but not used by the guard
    getResponse: () => ({}),
    getNext: () => ({}),
  };

  const context = {
    switchToHttp: () => httpContext,
    switchToRpc: () => ({}),
    switchToWs: () => ({}),
    getArgByIndex: () => null,
    getArgs: () => [],
    getClass: () => class Dummy {},
    getHandler: () =>
      function handler() {
        // no-op handler
      },
    getType: () => 'http',
  };

  // We cast once here, in a controlled way, only for test purposes
  return context as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: ConfigService;

  beforeEach(() => {
    // Strongly typed mock for ConfigService.get
    const mockConfig: Pick<ConfigService, 'get'> = {
      get: (key: string) => {
        if (key === 'API_KEY') {
          return 'valid-key';
        }
        return null;
      },
    };

    // Safe cast for constructor compatibility
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
