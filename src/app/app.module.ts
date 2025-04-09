import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { CoreModule } from '@core/core.module'
import { AuthModule } from '@modules/auth/auth.module'
import { UserModule } from '@modules/user/user.module'

import { TaskModule } from './modules/task/task.module'
import { TimeBlockModule } from './modules/time-block/time-block.module'
import appConfig from '@/config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig]
    }),
    CoreModule,
    UserModule,
    AuthModule,
    TaskModule,
    TimeBlockModule
  ]
})
export class AppModule {}
