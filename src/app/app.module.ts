import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { CoreModule } from '@core/core.module'
import { AuthModule } from '@modules/auth/auth.module'
import { UserModule } from '@modules/user/user.module'

import appConfig from '@/config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig]
    }),
    CoreModule,
    UserModule,
    AuthModule
  ]
})
export class AppModule {}
