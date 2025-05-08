import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Test, TestingModule } from '@nestjs/testing'

import { PrismaClient } from '@prisma/client'

import { AuthDto } from '../auth/dto/auth.dto'
import { TaskService } from '../task/task.service'

import { UserDto } from './dto/user.dto'
import { UserService } from './user.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('UserService', () => {
  let service: UserService
  let prisma: DeepMockProxy<PrismaClient>
  let taskService: DeepMockProxy<TaskService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, TaskService, PrismaService]
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(TaskService)
      .useValue(mockDeep<TaskService>())
      .compile()

    service = module.get<UserService>(UserService)
    prisma = module.get(PrismaService)
    taskService = module.get(TaskService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getById', () => {
    it('should return a user by ID', async function (this: void) {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        tasks: [],
        intervals: []
      }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await service.getById('1')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          tasks: true,
          intervals: { select: { work: true, break: true, count: true } }
        }
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('getByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await service.getByEmail('test@example.com')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const authDto: AuthDto = {
        email: 'test@example.com',
        password: 'password123'
      }
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: '',
        password: 'hashedPassword'
      }
      prisma.user.create.mockResolvedValue(mockUser as any)

      const result = await service.create(authDto)

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: authDto.email,
          password: expect.any(String),
          name: '',
          intervals: { create: {} }
        }
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const userDto: Partial<UserDto> = { name: 'Updated Name' }
      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name'
      }
      prisma.user.update.mockResolvedValue(mockUpdatedUser as any)

      const result = await service.update('1', userDto)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: userDto
      })
      expect(result).toEqual(mockUpdatedUser)
    })
  })

  describe('getProfile', () => {
    it('should return user profile with stats', async () => {
      const mockUser = { id: '1', email: 'test@example.com', tasks: [] }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      taskService.getCompletedTasks.mockResolvedValue(0)
      taskService.getTasksByDate.mockResolvedValue([
        {
          id: '1',
          name: 'Sample Task',
          createdAt: new Date(),
          updatedAt: new Date(),
          isCompleted: null,
          userId: '1',
          priority: null
        }
      ])

      const result = await service.getProfile('1')

      expect(prisma.user.findUnique).toHaveBeenCalled()
      expect(taskService.getCompletedTasks).toHaveBeenCalledWith('1')
      expect(result).toEqual({
        user: expect.any(Object),
        stats: expect.any(Array)
      })
    })
  })

  describe('getIntervals', () => {
    it('should return user intervals', async () => {
      const mockIntervals = { intervals: { count: 5 } }
      prisma.user.findUnique.mockResolvedValue(mockIntervals as any)

      const result = await service.getIntervals('1')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { intervals: { select: { count: true } } }
      })
      expect(result).toEqual(mockIntervals)
    })
  })
})
