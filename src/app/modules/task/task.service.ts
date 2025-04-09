import { Injectable } from '@nestjs/common'

import { TaskDto } from './dto/task.dto'
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

  async getAll(userId: string) {
    return this.prisma.task.findMany({
      where: {
        userId
      }
    })
  }

  async create(userId: string, taskDto: TaskDto) {
    return this.prisma.task.create({
      data: {
        ...taskDto,
        user: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  async update(taskDto: Partial<TaskDto>, taskId: string, userId: string) {
    return this.prisma.task.update({
      where: {
        userId,
        id: taskId
      },
      data: taskDto
    })
  }

  async delete(taskId: string, userId: string) {
    return this.prisma.task.delete({
      where: {
        userId,
        id: taskId
      }
    })
  }
}
