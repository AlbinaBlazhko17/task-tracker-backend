import { Module } from '@nestjs/common'
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core'

import { EmojiLogger } from '../logging/logger.service'
import { LoggingModule } from '../logging/logging.module'

import { AppExceptionsFilter } from './filters/app-exceptions.filter'

@Module({
  imports: [LoggingModule],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (httpAdapterHost: HttpAdapterHost, logger: EmojiLogger) => {
        return new AppExceptionsFilter(httpAdapterHost, logger)
      },
      inject: [HttpAdapterHost, EmojiLogger]
    }
  ]
})
export class ExceptionsModule {}
