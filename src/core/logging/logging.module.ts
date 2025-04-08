import { Module } from '@nestjs/common'

import { EmojiLogger } from './logger.service'

@Module({
  providers: [EmojiLogger],
  exports: [EmojiLogger]
})
export class LoggingModule {}
