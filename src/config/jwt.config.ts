import type { ConfigService } from '@nestjs/config'
import type { JwtModuleOptions } from '@nestjs/jwt'

export const getJwtConfig = (
  configService: ConfigService
): Promise<JwtModuleOptions> =>
  Promise.resolve({
    secret: configService.get<string>('JWT_SECRET')
  })
