import { Body, Controller, HttpCode, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}
