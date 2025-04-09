import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  getCompletedTasks(userId: string) {
    return this.prisma.task.count({
      where: {
        userId,
        isCompleted: true
      }
    })
  }

  getTasksByDate(userId: string, date: Date) {
    return this.prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: date.toISOString()
        }
      }
    })
  }
}
