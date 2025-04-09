import { Global, Module } from '@nestjs/common'

import { ExceptionsModule } from './exceptions/exceptions.module'
import { LoggingModule } from './logging/logging.module'
import { PrismaModule } from './prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule, LoggingModule, ExceptionsModule],
  exports: [PrismaModule, LoggingModule, ExceptionsModule]
})
export class CoreModule {}
