// src/common/filters/http-exception.filter.spec.ts
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  // Helper to create a minimal ArgumentsHost for HTTP context
  function createHttpArgumentsHost(req: Partial<Request>, res: Partial<Response>): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
        getNext: () => undefined,
      }),
      // The filter only uses switchToHttp, so the remaining
      // methods can be no-op implementations.
      switchToRpc: () => ({}) as never,
      switchToWs: () => ({}) as never,
      getArgByIndex: () => undefined,
      getArgs: () => [],
      getClass: () => class Dummy {} as never,
      getHandler: () => (() => undefined) as never,
      getType: () => 'http',
    } as ArgumentsHost;
  }

  it('should handle HttpException and return formatted response', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const mockResponse: Partial<Response> = {
      status: statusMock as unknown as Response['status'],
    };

    const mockRequest: Partial<Request> = {
      url: '/logs',
      method: 'GET',
    };

    const host = createHttpArgumentsHost(mockRequest as Request, mockResponse as Response);

    const exception = new HttpException(
      { message: 'Invalid payload', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/logs',
        method: 'GET',
        message: 'Invalid payload',
        error: 'Bad Request',
      }),
    );
  });

  it('should handle non-HttpException as internal server error', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const mockResponse: Partial<Response> = {
      status: statusMock as unknown as Response['status'],
    };

    const mockRequest: Partial<Request> = {
      url: '/logs',
      method: 'POST',
    };

    const host = createHttpArgumentsHost(mockRequest as Request, mockResponse as Response);

    const error = new Error('Something went wrong');

    filter.catch(error, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/logs',
        method: 'POST',
        message: 'Internal server error',
      }),
    );
  });

  it('should handle HttpException with strong body', () => {
    //ARRANGE
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const host = createHttpArgumentsHost(
      { url: '/logs', method: 'GET' } as Request,
      { status: statusMock as unknown as Response['status'] } as Response,
    );

    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    //ACT
    filter.catch(exception, host);

    //ASSERT
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
      }),
    );
  });

  it('should handle HttpException with object body containing only message', () => {
    //ARRANE
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const host = createHttpArgumentsHost(
      { url: '/logs', method: 'POST' } as Request,
      { status: statusMock as unknown as Response['status'] } as Response,
    );

    const exception = new HttpException({ message: 'Validation Failed' }, HttpStatus.BAD_REQUEST);

    //ACT
    filter.catch(exception, host);

    //ASSERT
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation Failed',
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const calledWith = jsonMock.mock.calls[0][0] as Record<string, unknown>;
    expect(calledWith.error).toBeUndefined();
  });

  it('should handle HttpException with message as array (class-validator)', () => {
    // ARRANGE
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const host = createHttpArgumentsHost(
      { url: '/logs', method: 'POST' } as Request,
      { status: statusMock as unknown as Response['status'] } as Response,
    );

    const exception = new HttpException(
      { message: ['field is required', 'field must be a string'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    // ACT
    filter.catch(exception, host);

    // ASSERT
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['field is required', 'field must be a string'],
        error: 'Bad Request',
      }),
    );
  });
});
