import { Test, TestingModule } from '@nestjs/testing'

import { PomodoroRoundDto } from './dto/pomodoro-round.dto'
import { PomodoroTimerController } from './pomodoro-timer.controller'
import { PomodoroTimerService } from './pomodoro-timer.service'

describe('PomodoroTimerController', () => {
  let controller: PomodoroTimerController
  let service: PomodoroTimerService

  const mockPomodoroTimerService = {
    getTodaySession: jest.fn(),
    create: jest.fn(),
    updateRound: jest.fn(),
    update: jest.fn(),
    deleteSession: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroTimerController],
      providers: [
        {
          provide: PomodoroTimerService,
          useValue: mockPomodoroTimerService
        }
      ]
    }).compile()

    controller = module.get<PomodoroTimerController>(PomodoroTimerController)
    service = module.get<PomodoroTimerService>(PomodoroTimerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getTodaySession', () => {
    it('should call pomodoroTimerService.getTodaySession with userId', async () => {
      const userId = 'user-id'
      const expectedResult = { id: 'session-id', rounds: [] }

      mockPomodoroTimerService.getTodaySession.mockResolvedValue(expectedResult)

      const result = await controller.getTodaySession(userId)

      expect(service.getTodaySession).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('create', () => {
    it('should call pomodoroTimerService.create with userId', async () => {
      const userId = 'user-id'
      const expectedResult = { id: 'new-session-id', rounds: [] }

      mockPomodoroTimerService.create.mockResolvedValue(expectedResult)

      const result = await controller.create(userId)

      expect(service.create).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('updateRound', () => {
    it('should call pomodoroTimerService.updateRound with correct parameters', async () => {
      const userId = 'user-id'
      const roundId = 'round-id'
      const pomodoroRoundDto: PomodoroRoundDto = {
        totalSeconds: 1500,
        isCompleted: true
      }
      const expectedResult = { id: roundId, ...pomodoroRoundDto }

      mockPomodoroTimerService.updateRound.mockResolvedValue(expectedResult)

      const result = await controller.updateRound(
        userId,
        roundId,
        pomodoroRoundDto
      )

      expect(service.updateRound).toHaveBeenCalledWith(
        roundId,
        pomodoroRoundDto,
        userId
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('update', () => {
    it('should call pomodoroTimerService.update with correct parameters', async () => {
      const userId = 'user-id'
      const sessionId = 'session-id'
      const pomodoroRoundDto: Partial<PomodoroRoundDto> = { totalSeconds: 1500 }
      const expectedResult = { id: sessionId, rounds: [] }

      mockPomodoroTimerService.update.mockResolvedValue(expectedResult)

      const result = await controller.update(
        userId,
        sessionId,
        pomodoroRoundDto
      )

      expect(service.update).toHaveBeenCalledWith(
        sessionId,
        pomodoroRoundDto,
        userId
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('deleteSession', () => {
    it('should call pomodoroTimerService.deleteSession with correct parameters', async () => {
      const userId = 'user-id'
      const sessionId = 'session-id'
      const expectedResult = { success: true }

      mockPomodoroTimerService.deleteSession.mockResolvedValue(expectedResult)

      const result = await controller.deleteSession(userId, sessionId)

      expect(service.deleteSession).toHaveBeenCalledWith(sessionId, userId)
      expect(result).toEqual(expectedResult)
    })
  })
})
