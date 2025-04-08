import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from './config/app.config'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CoreModule } from './core/core.module'

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
