import { Test, TestingModule } from '@nestjs/testing'

import { TimeBlockDto } from './dto/time-block.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { TimeBlockController } from './time-block.controller'
import { TimeBlockService } from './time-block.service'

describe('TimeBlockController', () => {
  let controller: TimeBlockController
  let service: TimeBlockService

  const mockTimeBlocks = [
    { id: '1', name: 'Block 1', duration: 60, userId: 'user123' },
    { id: '2', name: 'Block 2', duration: 30, userId: 'user123' }
  ]

  const mockTimeBlockService = {
    findAll: jest.fn().mockResolvedValue(mockTimeBlocks),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateOrder: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeBlockController],
      providers: [
        {
          provide: TimeBlockService,
          useValue: mockTimeBlockService
        }
      ]
    }).compile()

    controller = module.get<TimeBlockController>(TimeBlockController)
    service = module.get<TimeBlockService>(TimeBlockService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all time blocks for a user', async () => {
      const userId = 'user123'

      const result = await controller.findAll(userId)

      expect(service.findAll).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockTimeBlocks)
    })
  })

  describe('create', () => {
    it('should create a new time block', async () => {
      const userId = 'user123'
      const timeBlockDto: TimeBlockDto = {
        name: 'New Block',
        duration: 60,
        order: 1,
        color: 'blue'
      }
      const mockCreatedBlock = {
        id: '3',
        ...timeBlockDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedBlock)

      const result = await controller.create(timeBlockDto, userId)

      expect(service.create).toHaveBeenCalledWith(timeBlockDto, userId)
      expect(result).toEqual(mockCreatedBlock)
    })
  })

  describe('update', () => {
    it('should update an existing time block', async () => {
      const userId = 'user123'
      const id = '1'
      const timeBlockDto: Partial<TimeBlockDto> = { name: 'Updated Block' }
      const mockUpdatedBlock = {
        ...mockTimeBlocks[0],
        ...timeBlockDto,
        userId,
        color: 'red',
        duration: 60,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedBlock)

      const result = await controller.update(timeBlockDto, userId, id)

      expect(service.update).toHaveBeenCalledWith(id, timeBlockDto, userId)
      expect(result).toEqual(mockUpdatedBlock)
    })
  })

  describe('delete', () => {
    it('should delete a time block', async () => {
      const userId = 'user123'
      const id = '1'
      const mockDeletedBlock = {
        id,
        userId,
        name: 'Block 1',
        order: 1,
        color: 'red',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'delete').mockResolvedValue(mockDeletedBlock)

      const result = await controller.delete(userId, id)

      expect(service.delete).toHaveBeenCalledWith(id, userId)
      expect(result).toEqual(mockDeletedBlock)
    })
  })

  describe('updateOrder', () => {
    it('should update the order of time blocks', async () => {
      const updateOrderDto: UpdateOrderDto = { ids: ['2', '1'] }
      const mockTransactionResult = [
        { id: '2', order: 0 },
        { id: '1', order: 1 }
      ]
      jest
        .spyOn(service, 'updateOrder')
        .mockResolvedValue(mockTransactionResult as any)

      const result = await controller.updateOrder(updateOrderDto)

      expect(service.updateOrder).toHaveBeenCalledWith(updateOrderDto.ids)
      expect(result).toEqual(mockTransactionResult)
    })
  })
})
