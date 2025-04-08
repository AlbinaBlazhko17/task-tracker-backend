import { Request, Response } from 'express'

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Optional
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { EmojiLogger } from '@core/logging/logger.service'

@Catch(HttpException)
export class AppExceptionsFilter implements ExceptionFilter {
  constructor(
    @Optional()
    @Inject(HttpAdapterHost)
    private readonly httpAdapterHost?: HttpAdapterHost,
    private readonly emojiLogger?: EmojiLogger
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception.getStatus()
    const message = exception.message

    const path = this.getRequestUrlSafe(request)

    const errorResponse = {
      statusCode: status,
      message,
      path,
      error: exception.name,
      timestamp: new Date().toISOString()
    }

    this.emojiLogger?.error(
      `HTTP Status: ${status} | Error Message: ${message} | Request URL: ${path}`,
      exception.stack ?? ''
    )

    response.status(status).json(errorResponse)
  }

  private getRequestUrlSafe(request: Request): string {
    try {
      return (
        this.httpAdapterHost?.httpAdapter?.getRequestUrl(request) ?? request.url
      )
    } catch {
      return request.url
    }
  }
}
