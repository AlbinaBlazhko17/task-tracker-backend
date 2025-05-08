import { Test, TestingModule } from '@nestjs/testing'

import { TaskDto } from './dto/task.dto'
import { TaskService } from './task.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('TaskService', () => {
  let service: TaskService
  let prisma: PrismaService
  const userId = 'user1'
  const fixedDate = new Date('2023-01-01T00:00:00Z')

  const mockTasks = [
    {
      id: 'task1',
      name: 'Task 1',
      userId,
      isCompleted: false,
      priority: 'high' as const,
      createdAt: fixedDate,
      updatedAt: fixedDate
    },
    {
      id: 'task2',
      name: 'Task 2',
      userId,
      isCompleted: true,
      priority: 'low' as const,
      createdAt: fixedDate,
      updatedAt: fixedDate
    }
  ]

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
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getCompletedTasks', () => {
    it('should return the count of completed tasks for a user', async () => {
      const completedTasksCount = 5
      jest.spyOn(prisma.task, 'count').mockResolvedValue(completedTasksCount)

      const result = await service.getCompletedTasks(userId)

      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { userId, isCompleted: true }
      })
      expect(result).toEqual(completedTasksCount)
    })
  })

  describe('getTasksByDate', () => {
    it('should return tasks created on or after a specific date', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(mockTasks)

      const result = await service.getTasksByDate(userId, fixedDate)

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          createdAt: { gte: fixedDate.toISOString() }
        }
      })
      expect(result).toEqual(mockTasks)
    })
  })

  describe('getAll', () => {
    it('should return all tasks for a user', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(mockTasks)

      const result = await service.getAll(userId)

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId }
      })
      expect(result).toEqual(mockTasks)
    })
  })

  describe('create', () => {
    it('should create a new task for a user', async () => {
      const taskDto: TaskDto = {
        name: 'Task 1',
        priority: 'high' as const,
        isCompleted: false
      }
      const createdTask = {
        id: 'task1',
        userId,
        createdAt: fixedDate,
        updatedAt: fixedDate,
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
      expect(result).toEqual(createdTask)
    })
  })

  describe('update', () => {
    it('should update an existing task for a user', async () => {
      const taskId = 'task1'
      const taskDto: Partial<TaskDto> = {
        name: 'Updated Task',
        priority: 'low' as const,
        isCompleted: true
      }
      const updatedTask = {
        id: taskId,
        userId,
        name: 'Updated Task',
        priority: 'low' as const,
        isCompleted: true,
        createdAt: fixedDate,
        updatedAt: fixedDate
      }
      jest.spyOn(prisma.task, 'update').mockResolvedValue(updatedTask)

      const result = await service.update(taskDto, taskId, userId)

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { userId, id: taskId },
        data: taskDto
      })
      expect(result).toEqual(updatedTask)
    })
  })

  describe('delete', () => {
    it('should delete a task for a user', async () => {
      const taskId = 'task1'
      const deletedTask = mockTasks[0]
      jest.spyOn(prisma.task, 'delete').mockResolvedValue(deletedTask)

      const result = await service.delete(taskId, userId)

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { userId, id: taskId }
      })
      expect(result).toEqual(deletedTask)
    })
  })
})
