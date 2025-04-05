import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter
} from '@nestjs/common'
import type { HttpAdapterHost } from '@nestjs/core'
import type { Response, Request } from 'express'
import type { EmojiLogger } from './logger.service'

@Catch(HttpException)
export class AppExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly emojiLogger: EmojiLogger
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500
    const message = exception.message

    const errorResponse = {
      statusCode: status,
      message,
      path: httpAdapter.getRequestUrl(request),
      error: exception.name,
      timestamp: new Date().toISOString()
    }

    this.emojiLogger.error(
      `HTTP Status: ${status} | Error Message: ${message} | Request URL: ${httpAdapter.getRequestUrl(request)}`,
      exception.stack ?? ''
    )

    response.status(status).json({
      ...errorResponse
    })
  }
}
