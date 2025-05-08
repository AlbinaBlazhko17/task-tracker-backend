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

  // Common mock data
  const mockUserId = '1'
  const mockEmail = 'test@example.com'
  const mockUserBase = {
    id: mockUserId,
    email: mockEmail
  }

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
    it('should return user with tasks and intervals when found', async () => {
      const mockUser = {
        ...mockUserBase,
        tasks: [],
        intervals: []
      }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await service.getById(mockUserId)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          tasks: true,
          intervals: { select: { work: true, break: true, count: true } }
        }
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('getByEmail', () => {
    it('should return user when email exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserBase as any)

      const result = await service.getByEmail(mockEmail)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail }
      })
      expect(result).toEqual(mockUserBase)
    })
  })

  describe('create', () => {
    it('should create and return a new user', async () => {
      const authDto: AuthDto = {
        email: mockEmail,
        password: 'password123'
      }
      const mockUser = {
        ...mockUserBase,
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
    it('should update and return user with new data', async () => {
      const userDto: Partial<UserDto> = { name: 'Updated Name' }
      const mockUpdatedUser = {
        ...mockUserBase,
        name: 'Updated Name'
      }
      prisma.user.update.mockResolvedValue(mockUpdatedUser as any)

      const result = await service.update(mockUserId, userDto)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: userDto
      })
      expect(result).toEqual(mockUpdatedUser)
    })
  })

  describe('getProfile', () => {
    it('should return user profile with statistics', async () => {
      const mockUser = { ...mockUserBase, tasks: [] }
      const mockTask = {
        id: '1',
        name: 'Sample Task',
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: null,
        userId: mockUserId,
        priority: null
      }

      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      taskService.getCompletedTasks.mockResolvedValue(0)
      taskService.getTasksByDate.mockResolvedValue([mockTask])

      const result = await service.getProfile(mockUserId)

      expect(prisma.user.findUnique).toHaveBeenCalled()
      expect(taskService.getCompletedTasks).toHaveBeenCalledWith(mockUserId)
      expect(result).toEqual({
        user: expect.any(Object),
        stats: expect.any(Array)
      })
    })
  })

  describe('getIntervals', () => {
    it('should return user intervals data', async () => {
      const mockIntervals = { intervals: { count: 5 } }
      prisma.user.findUnique.mockResolvedValue(mockIntervals as any)

      const result = await service.getIntervals(mockUserId)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { intervals: { select: { count: true } } }
      })
      expect(result).toEqual(mockIntervals)
    })
  })
})
