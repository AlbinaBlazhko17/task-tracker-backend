import { hash } from 'argon2'

import { Injectable } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'

import type { AuthDto } from '../auth/dto/auth.dto'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      include: {
        tasks: true
      }
    })
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  async create(authDto: AuthDto) {
    const user = {
      email: authDto.email,
      password: await hash(authDto.password),
      name: ''
    }

    return this.prisma.user.create({
      data: user
    })
  }
}
