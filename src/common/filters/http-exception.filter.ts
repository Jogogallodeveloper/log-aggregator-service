import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // This method catches all exceptions thrown in the application
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // HttpException.getResponse() can be:
      // - string
      // - { message: string | string[]; error?: string; ... }
      let message: string | string[] = exception.message;
      let error: string | undefined;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (body.message !== undefined) {
          message = body.message;
        }
        if (body.error !== undefined) {
          error = body.error;
        }
      }

      const errorResponse: ErrorResponseBody = {
        statusCode: status,
        timestamp,
        path,
        method,
        message,
        error,
      };

      // Log structured error for observability
      this.logger.error(`HTTP Exception: ${JSON.stringify(errorResponse)}`, exception.stack);

      response.status(status).json(errorResponse);
      return;
    }

    // Fallback for unexpected errors (non-HttpException)
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const genericErrorResponse: ErrorResponseBody = {
      statusCode: status,
      timestamp,
      path,
      method,
      message: 'Internal server error',
    };

    // Log unexpected error details
    this.logger.error(
      `Unexpected error: ${JSON.stringify(genericErrorResponse)}`,
      (exception as Error)?.stack,
    );

    response.status(status).json(genericErrorResponse);
  }
}
