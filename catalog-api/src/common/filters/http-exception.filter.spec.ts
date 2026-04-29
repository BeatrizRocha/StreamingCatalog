import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost, Logger } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = {
    url: '/test-path',
    method: 'GET',
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnValue(mockResponse),
    getRequest: jest.fn().mockReturnValue(mockRequest),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('should handle HttpException correctly', () => {
    const status = HttpStatus.BAD_REQUEST;
    const message = 'Bad Request';
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: status,
        message: message,
        path: mockRequest.url,
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle generic Error correctly (Internal Server Error)', () => {
    const message = 'System failure';
    const exception = new Error(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: mockRequest.url,
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const status = HttpStatus.NOT_FOUND;
    const exceptionResponse = { message: ['error 1', 'error 2'] };
    const exception = new HttpException(exceptionResponse, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: exceptionResponse.message,
      }),
    );
  });
});
