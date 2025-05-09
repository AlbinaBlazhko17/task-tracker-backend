import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { UserService } from '../user/user.service'

import { PomodoroRoundDto } from './dto/pomodoro-round.dto'
import { PomodoroSessionDto } from './dto/pomodoro-session.dto'
import { PomodoroTimerService } from './pomodoro-timer.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('PomodoroTimerService', () => {
  let service: PomodoroTimerService

  const mockPrismaService = {
    pomodoroSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    pomodoroRound: {
      update: jest.fn()
    }
  }

  const mockUserService = {
    getIntervals: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PomodoroTimerService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compile()

    service = module.get<PomodoroTimerService>(PomodoroTimerService)

    jest.clearAllMocks()
  })

  describe('getTodaySession', () => {
    it('should return a pomodoro session for today', async () => {
      const userId = 'user-id'
      const mockSession = { id: 'session-id', userId }

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(mockSession)

      const result = await service.getTodaySession(userId)

      expect(mockPrismaService.pomodoroSession.findFirst).toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })

    it('should return null if no session exists for today', async () => {
      const userId = 'user-id'

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(null)

      const result = await service.getTodaySession(userId)

      expect(mockPrismaService.pomodoroSession.findFirst).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should return existing session if one already exists for today', async () => {
      const userId = 'user-id'
      const mockExistingSession = { id: 'existing-session', userId }

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(
        mockExistingSession
      )

      const result = await service.create(userId)

      expect(mockPrismaService.pomodoroSession.findFirst).toHaveBeenCalled()
      expect(mockUserService.getIntervals).not.toHaveBeenCalled()
      expect(result).toEqual(mockExistingSession)
    })

    it('should create a new pomodoro session if no session exists for today', async () => {
      const userId = 'user-id'
      const mockUser = { id: userId, intervals: { count: 4 } }
      const mockCreatedSession = {
        id: 'new-session',
        userId,
        pomodoroRounds: [{ id: 'round-1', totalSeconds: 0, isCompleted: false }]
      }

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(null)
      mockUserService.getIntervals.mockResolvedValue(mockUser)
      mockPrismaService.pomodoroSession.create.mockResolvedValue(
        mockCreatedSession
      )

      const result = await service.create(userId)

      expect(mockPrismaService.pomodoroSession.findFirst).toHaveBeenCalled()
      expect(mockUserService.getIntervals).toHaveBeenCalledWith(userId)
      expect(mockPrismaService.pomodoroSession.create).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedSession)
    })

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'non-existent-user'

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(null)
      mockUserService.getIntervals.mockResolvedValue(null)

      await expect(service.create(userId)).rejects.toThrow(NotFoundException)
      expect(mockPrismaService.pomodoroSession.findFirst).toHaveBeenCalled()
      expect(mockUserService.getIntervals).toHaveBeenCalledWith(userId)
    })

    it('should handle user without intervals', async () => {
      const userId = 'user-id'
      const mockUser = { id: userId }
      const mockCreatedSession = {
        id: 'new-session',
        userId,
        pomodoroRounds: []
      }

      mockPrismaService.pomodoroSession.findFirst.mockResolvedValue(null)
      mockUserService.getIntervals.mockResolvedValue(mockUser)
      mockPrismaService.pomodoroSession.create.mockResolvedValue(
        mockCreatedSession
      )

      const result = await service.create(userId)

      expect(mockPrismaService.pomodoroSession.create).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedSession)
    })
  })

  describe('update', () => {
    it('should update a pomodoro session', async () => {
      const sessionId = 'session-id'
      const userId = 'user-id'
      const updateDto: Partial<PomodoroSessionDto> = { isCompleted: true }
      const mockUpdatedSession = { id: sessionId, userId, ...updateDto }

      mockPrismaService.pomodoroSession.update.mockResolvedValue(
        mockUpdatedSession
      )

      const result = await service.update(sessionId, updateDto, userId)

      expect(mockPrismaService.pomodoroSession.update).toHaveBeenCalledWith({
        where: { userId, id: sessionId },
        data: updateDto
      })
      expect(result).toEqual(mockUpdatedSession)
    })
  })

  describe('updateRound', () => {
    it('should update a pomodoro round', async () => {
      const roundId = 'round-id'
      const userId = 'user-id'
      const updateDto: Partial<PomodoroRoundDto> = {
        totalSeconds: 300,
        isCompleted: true
      }
      const mockUpdatedRound = { id: roundId, ...updateDto }

      mockPrismaService.pomodoroRound.update.mockResolvedValue(mockUpdatedRound)

      const result = await service.updateRound(roundId, updateDto, userId)

      expect(mockPrismaService.pomodoroRound.update).toHaveBeenCalledWith({
        where: { id: roundId, pomodoroSession: { userId } },
        data: updateDto
      })
      expect(result).toEqual(mockUpdatedRound)
    })
  })

  describe('deleteSession', () => {
    it('should delete a pomodoro session', async () => {
      const sessionId = 'session-id'
      const userId = 'user-id'
      const mockDeletedSession = { id: sessionId, userId }

      mockPrismaService.pomodoroSession.delete.mockResolvedValue(
        mockDeletedSession
      )

      const result = await service.deleteSession(sessionId, userId)

      expect(mockPrismaService.pomodoroSession.delete).toHaveBeenCalledWith({
        where: { userId, id: sessionId }
      })
      expect(result).toEqual(mockDeletedSession)
    })
  })
})
