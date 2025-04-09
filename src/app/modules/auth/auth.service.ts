import { verify } from 'argon2'
import type { Response } from 'express'

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { removePassword } from '@utils/helpers/remove-password.helper'

import { UserService } from '../user/user.service'

import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  readonly REFRESH_TOKEN_NAME = 'refreshToken'

  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async sigIn(authDto: AuthDto) {
    const user = await this.validateUser(authDto)

    const tokens = this.issueToken(user.id)
    return {
      ...user,
      ...tokens
    }
  }

  async signUp(authDto: AuthDto) {
    const oldUser = await this.userService.getByEmail(authDto.email)

    if (oldUser) throw new BadRequestException('User already exists')

    const user = await this.userService.create(authDto)

    const tokens = this.issueToken(user.id)

    return {
      ...removePassword(user),
      ...tokens
    }
  }

  async signOut(res: Response, refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token found')

    const payload = await this.jwtService.verifyAsync(refreshToken)

    if (!payload) throw new UnauthorizedException('Invalid refresh token')
    const user = await this.userService.getById(payload.id)

    if (!user) throw new NotFoundException('User not found')

    this.removeRefreshTokenFromResponse(res)

    return {
      message: 'Logout successful'
    }
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.DOMAIN
          : 'localhost',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresIn
    })
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.clearCookie(this.REFRESH_TOKEN_NAME, {
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.DOMAIN
          : 'localhost',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken)

    if (!payload) throw new UnauthorizedException('Invalid refresh token')

    const user = await this.userService.getById(payload.id)

    if (!user) throw new NotFoundException('User not found')

    const tokens = this.issueToken(user.id)

    return {
      ...removePassword(user),
      ...tokens
    }
  }

  private issueToken(userId: string) {
    const payload = { id: userId }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h'
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d'
    })

    return { accessToken, refreshToken }
  }

  private async validateUser(authDto: AuthDto) {
    const user = await this.userService.getByEmail(authDto.email)

    if (!user) throw new NotFoundException('User not found')

    const isPasswordValid = await verify(user.password, authDto.password)

    if (!isPasswordValid) throw new UnauthorizedException('Invalid password')

    return removePassword(user)
  }
}
