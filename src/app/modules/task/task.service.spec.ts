import { Test, TestingModule } from '@nestjs/testing'

import { TaskDto } from './dto/task.dto'
import { TaskService } from './task.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('TaskService', () => {
  let service: TaskService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              count: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ]
    }).compile()

    service = module.get<TaskService>(TaskService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getCompletedTasks', () => {
    it('should return the count of completed tasks for a user', async () => {
      const userId = 'user1'
      const completedTasksCount = 5
      jest.spyOn(prisma.task, 'count').mockResolvedValue(completedTasksCount)

      const result = await service.getCompletedTasks(userId)

      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { userId, isCompleted: true }
      })
      expect(result).toBe(completedTasksCount)
    })
  })

  describe('getTasksByDate', () => {
    it('should return tasks created on or after a specific date', async () => {
      const userId = 'user1'
      const date = new Date()
      const mockTasks = [
        {
          id: 'task1',
          name: 'Task 1',
          userId: userId,
          isCompleted: false,
          priority: 'high' as const,
          createdAt: date,
          updatedAt: date
        },
        {
          id: 'task2',
          name: 'Task 2',
          userId: userId,
          isCompleted: true,
          priority: 'low' as const,
          createdAt: date,
          updatedAt: date
        }
      ]

      const result = await service.getTasksByDate(userId, date)

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          createdAt: { gte: date.toISOString() }
        }
      })
      expect(result).toEqual(mockTasks)
    })
  })

  describe('getAll', () => {
    it('should return all tasks for a user', async () => {
      const userId = 'user1'
      const date = new Date()
      const tasks = [
        {
          id: 'task1',
          name: 'Task 1',
          userId: userId,
          isCompleted: false,
          priority: 'high' as const,
          createdAt: date,
          updatedAt: date
        },
        {
          id: 'task2',
          name: 'Task 2',
          userId: userId,
          isCompleted: true,
          priority: 'low' as const,
          createdAt: date,
          updatedAt: date
        }
      ]
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(tasks)

      const result = await service.getAll(userId)

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId }
      })
      expect(result).toBe(tasks)
    })
  })

  describe('create', () => {
    it('should create a new task for a user', async () => {
      const userId = 'user1'
      const taskDto: TaskDto = {
        name: 'Task 1',
        priority: 'high' as const,
        isCompleted: false
      }
      const createdTask = {
        id: 'task1',
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...taskDto
      }
      jest.spyOn(prisma.task, 'create').mockResolvedValue(createdTask)

      const result = await service.create(userId, taskDto)

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...taskDto,
          user: { connect: { id: userId } }
        }
      })
      expect(result).toBe(createdTask)
    })
  })

  describe('update', () => {
    it('should update an existing task for a user', async () => {
      const userId = 'user1'
      const taskId = 'task1'
      const taskDto: Partial<TaskDto> = {
        name: 'Updated Task',
        priority: 'low' as const,
        isCompleted: true
      }
      const updatedTask = {
        id: taskId,
        userId: userId,
        name: 'Updated Task',
        priority: 'low' as const,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(prisma.task, 'update').mockResolvedValue(updatedTask)

      const result = await service.update(taskDto, taskId, userId)

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { userId, id: taskId },
        data: taskDto
      })
      expect(result).toBe(updatedTask)
    })
  })

  describe('delete', () => {
    it('should delete a task for a user', async () => {
      const userId = 'user1'
      const taskId = 'task1'
      const deletedTask = {
        id: taskId,
        userId: userId,
        name: 'Task 1',
        priority: 'high' as const,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(prisma.task, 'delete').mockResolvedValue(deletedTask)

      const result = await service.delete(taskId, userId)

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { userId, id: taskId }
      })
      expect(result).toBe(deletedTask)
    })
  })
})
