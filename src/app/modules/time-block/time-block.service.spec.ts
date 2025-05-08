import { Test, TestingModule } from '@nestjs/testing'

import { TimeBlockDto } from './dto/time-block.dto'
import { TimeBlockService } from './time-block.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('TimeBlockService', () => {
  let service: TimeBlockService
  let prisma: PrismaService

  const mockPrismaService = {
    timeBlock: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn()
    },
    $transaction: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeBlockService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<TimeBlockService>(TimeBlockService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all time blocks for a user', async () => {
      const mockTimeBlocks = [
        {
          id: '1',
          userId: 'user1',
          order: 1,
          name: 'Block 1',
          color: 'red',
          duration: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      mockPrismaService.timeBlock.findMany.mockResolvedValue(mockTimeBlocks)

      const result = await service.findAll('user1')
      expect(result).toEqual(mockTimeBlocks)
      expect(prisma.timeBlock.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { order: 'asc' }
      })
    })
  })

  describe('create', () => {
    it('should create a new time block', async () => {
      const timeBlockDto: TimeBlockDto = {
        name: 'Test Block',
        order: 1,
        color: 'red',
        duration: 30
      }
      const mockTimeBlock = {
        id: '1',
        ...timeBlockDto,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockPrismaService.timeBlock.create.mockResolvedValue(mockTimeBlock)

      const result = await service.create(timeBlockDto, 'user1')
      expect(result).toEqual(mockTimeBlock)
      expect(prisma.timeBlock.create).toHaveBeenCalledWith({
        data: {
          ...timeBlockDto,
          user: { connect: { id: 'user1' } }
        }
      })
    })
  })

  describe('update', () => {
    it('should update a time block', async () => {
      const timeBlockDto: Partial<TimeBlockDto> = { name: 'Updated Block' }
      const mockUpdatedBlock = {
        id: '1',
        name: 'Updated Block',
        userId: 'user1',
        order: 1,
        color: 'red',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockPrismaService.timeBlock.update.mockResolvedValue(mockUpdatedBlock)

      const result = await service.update('1', timeBlockDto, 'user1')
      expect(result).toEqual(mockUpdatedBlock)
      expect(prisma.timeBlock.update).toHaveBeenCalledWith({
        where: { userId: 'user1', id: '1' },
        data: timeBlockDto
      })
    })
  })

  describe('delete', () => {
    it('should delete a time block', async () => {
      const mockDeletedBlock = {
        id: '1',
        userId: 'user1',
        name: 'Block 1',
        order: 1,
        color: 'red',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockPrismaService.timeBlock.delete.mockResolvedValue(mockDeletedBlock)

      const result = await service.delete('1', 'user1')
      expect(result).toEqual(mockDeletedBlock)
      expect(prisma.timeBlock.delete).toHaveBeenCalledWith({
        where: { userId: 'user1', id: '1' }
      })
    })
  })

  describe('updateOrder', () => {
    it('should update the order of time blocks', async () => {
      const ids = ['1', '2', '3']
      const mockTransactionResult = [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 }
      ]
      mockPrismaService.$transaction.mockImplementation(
        (callback: (prisma: typeof mockPrismaService) => any) => {
          if (typeof callback === 'function') {
            return callback(mockPrismaService)
          }
          return mockTransactionResult
        }
      )

      const result = await service.updateOrder(ids)
      expect(result).toEqual(mockTransactionResult)
      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
