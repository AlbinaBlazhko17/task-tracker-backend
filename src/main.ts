import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import * as cookieParser from 'cookie-parser'
import { AppExceptionsFilter } from './app/app-exceptions.filter'
import { EmojiLogger } from './app/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new EmojiLogger()
  })

  app.setGlobalPrefix('/api')
  app.use(cookieParser())
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  app.useGlobalFilters(new AppExceptionsFilter(app.get(HttpAdapterHost)))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
