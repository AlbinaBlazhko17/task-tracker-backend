import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { UserService } from '../user/user.service'

import type { LoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  login(loginDto: LoginDto) {
    return loginDto
  }
}
