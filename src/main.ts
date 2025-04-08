import * as cookieParser from 'cookie-parser'

import { NestFactory } from '@nestjs/core'

import { AppModule } from '@app/app.module'

import { EmojiLogger } from '@/core/logging/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  })

  const logger = app.get(EmojiLogger)

  app.useLogger(logger)
  app.setGlobalPrefix('/api')
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
