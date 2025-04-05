import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter
} from '@nestjs/common'
import type { HttpAdapterHost } from '@nestjs/core'
import type { Response, Request } from 'express'

@Catch(HttpException)
export class AppExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error'

    const errorResponse = {
      statusCode: status,
      message: typeof message === 'string' ? message : message['message'],
      path: httpAdapter.getRequestUrl(request),
      error: status === 500 ? 'Internal server error' : message['error'],
      timestamp: new Date().toISOString()
    }

    response.status(status).json({
      ...errorResponse
    })
  }
}
