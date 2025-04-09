import { Injectable } from '@nestjs/common'

import { TimeBlockDto } from './dto/time-block.dto'
import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class TimeBlockService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.timeBlock.findMany({
      where: {
        userId
      },
      orderBy: {
        order: 'asc'
      }
    })
  }

  async create(timeBlockDto: TimeBlockDto, userId: string) {
    return this.prisma.timeBlock.create({
      data: {
        ...timeBlockDto,
        user: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  async update(
    id: string,
    timeBlockDto: Partial<TimeBlockDto>,
    userId: string
  ) {
    return this.prisma.timeBlock.update({
      where: {
        userId,
        id
      },
      data: timeBlockDto
    })
  }

  async delete(id: string, userId: string) {
    return this.prisma.timeBlock.delete({
      where: {
        userId,
        id
      }
    })
  }

  async updateOrder(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.timeBlock.update({
          where: {
            id
          },
          data: {
            order: index
          }
        })
      )
    )
  }
}
