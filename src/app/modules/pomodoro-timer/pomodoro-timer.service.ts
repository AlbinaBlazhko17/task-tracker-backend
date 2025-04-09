import { Injectable, NotFoundException } from '@nestjs/common'

import { UserService } from '../user/user.service'

import { PomodoroRoundDto } from './dto/pomodoro-round.dto'
import { PomodoroSessionDto } from './dto/pomodoro-session.dto'
import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class PomodoroTimerService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async getTodaySession(userId: string) {
    const today = new Date().toISOString().split('T')[0]

    return this.prisma.pomodoroSession.findFirst({
      where: {
        createdAt: {
          gte: new Date(today)
        },
        userId
      },
      include: {
        pomodoroRounds: {
          orderBy: {
            id: 'asc'
          },
          select: {
            id: true,
            totalSeconds: true,
            isCompleted: true
          }
        }
      }
    })
  }

  async create(userId: string) {
    const todaySession = await this.getTodaySession(userId)

    if (todaySession) return todaySession

    const user = await this.userService.getIntervals(userId)

    if (!user) throw new NotFoundException('User not found')

    const intervalsCount = user.intervals?.count ?? 0

    return this.prisma.pomodoroSession.create({
      data: {
        pomodoroRounds: {
          createMany: {
            data: Array.from({ length: intervalsCount }, () => ({
              totalSeconds: 0
            }))
          }
        },
        user: {
          connect: {
            id: userId
          }
        }
      },
      include: {
        pomodoroRounds: {
          select: {
            id: true,
            totalSeconds: true,
            isCompleted: true
          }
        }
      }
    })
  }

  async update(
    id: string,
    pomodoroSessionDto: Partial<PomodoroSessionDto>,
    userId: string
  ) {
    return this.prisma.pomodoroSession.update({
      where: {
        userId,
        id
      },
      data: pomodoroSessionDto
    })
  }

  async updateRound(
    id: string,
    pomodoroRoundDto: Partial<PomodoroRoundDto>,
    userId: string
  ) {
    return this.prisma.pomodoroRound.update({
      where: {
        id,
        pomodoroSession: {
          userId
        }
      },
      data: pomodoroRoundDto
    })
  }

  async deleteSession(id: string, userId: string) {
    return this.prisma.pomodoroSession.delete({
      where: {
        userId,
        id
      }
    })
  }
}
