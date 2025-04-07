import { Injectable, type OnModuleInit } from '@nestjs/common'
import { PrismaClient } from 'prisma/generated/prisma'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }
}
