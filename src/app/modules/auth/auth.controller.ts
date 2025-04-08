import type { Request, Response } from 'express'

import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('sign-in')
  async sigIn(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...user } = await this.authService.sigIn(authDto)

    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  @HttpCode(200)
  @Post('sign-up')
  async signUp(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...user } = await this.authService.sigIn(authDto)

    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  @HttpCode(200)
  @Post('sign-out')
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.signOut(
      res,
      req.cookies[this.authService.REFRESH_TOKEN_NAME]
    )
  }

  @HttpCode(200)
  @Post('refresh-tokens')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshTokenFromReq: string =
      req.cookies[this.authService.REFRESH_TOKEN_NAME]

    if (!refreshTokenFromReq) {
      this.authService.removeRefreshTokenFromResponse(res)

      return new UnauthorizedException('Refresh token not found')
    }

    const { refreshToken, ...response } =
      await this.authService.refreshTokens(refreshTokenFromReq)

    this.authService.addRefreshTokenToResponse(res, refreshToken)

    return response
  }
}
