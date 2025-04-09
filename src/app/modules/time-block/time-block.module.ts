import { Module } from '@nestjs/common'

import { TimeBlockController } from './time-block.controller'
import { TimeBlockService } from './time-block.service'

@Module({
  controllers: [TimeBlockController],
  providers: [TimeBlockService]
})
export class TimeBlockModule {}
