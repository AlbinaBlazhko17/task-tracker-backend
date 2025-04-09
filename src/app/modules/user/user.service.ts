import { hash } from 'argon2'
import { startOfDay, subDays } from 'date-fns'

import { Injectable } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'

import { AuthDto } from '../auth/dto/auth.dto'
import { TaskService } from '../task/task.service'

import { UserDto } from './dto/user.dto'
import { removePassword } from '@/utils/helpers/remove-password.helper'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private taskService: TaskService
  ) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      include: {
        tasks: true,
        intervals: {
          select: {
            work: true,
            break: true,
            count: true
          }
        }
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

  async getProfile(id: string) {
    const user = await this.getById(id)

    const totalTasks = user?.tasks.length || 0
    const completedTasks = await this.taskService.getCompletedTasks(id)

    const todayStart = startOfDay(new Date())
    const weekStart = startOfDay(subDays(new Date(), 7))

    const todayTasks = await this.taskService.getTasksByDate(id, todayStart)
    const weekTasks = await this.taskService.getTasksByDate(id, weekStart)

    return {
      user: removePassword(user),
      stats: [
        { label: 'Total', value: totalTasks },
        { label: 'Completed tasks', value: completedTasks },
        { label: 'Today tasks', value: todayTasks },
        { label: 'Week tasks', value: weekTasks }
      ]
    }
  }

  async create(authDto: AuthDto) {
    const user = {
      email: authDto.email,
      password: await hash(authDto.password),
      name: ''
    }

    return this.prisma.user.create({
      data: {
        ...user,
        intervals: {
          create: {}
        }
      }
    })
  }

  async update(id: string, userDto: Partial<UserDto>) {
    let data = userDto

    if (userDto.password) {
      data = {
        ...removePassword(userDto),
        password: await hash(userDto.password)
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id
      },
      data: data
    })

    return removePassword(updatedUser)
  }

  async getIntervals(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        intervals: {
          select: {
            count: true
          }
        }
      }
    })
  }
}
