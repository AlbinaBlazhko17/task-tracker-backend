import { Test, TestingModule } from '@nestjs/testing'

import { TaskDto } from './dto/task.dto'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

describe('TaskController', () => {
  let controller: TaskController
  let service: TaskService

  const userId = '123'
  const taskId = '1'
  const mockTask = {
    id: taskId,
    name: 'Test Task',
    priority: 'high' as const,
    userId,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            getAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<TaskController>(TaskController)
    service = module.get<TaskService>(TaskService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAllTasks', () => {
    it('should call TaskService.getAll with userId and return tasks', async () => {
      const tasks = [mockTask]
      jest.spyOn(service, 'getAll').mockResolvedValue(tasks)

      const result = await controller.getAllTasks(userId)

      expect(service.getAll).toHaveBeenCalledWith(userId)
      expect(result).toEqual(tasks)
    })
  })

  describe('create', () => {
    it('should call TaskService.create with userId and taskDto and return the created task', async () => {
      const taskDto: TaskDto = {
        name: 'New Task',
        priority: 'high' as const,
        isCompleted: false
      }
      const createdTask = { ...mockTask, ...taskDto }
      jest.spyOn(service, 'create').mockResolvedValue(createdTask)

      const result = await controller.create(taskDto, userId)

      expect(service.create).toHaveBeenCalledWith(userId, taskDto)
      expect(result).toEqual(createdTask)
    })
  })

  describe('update', () => {
    it('should call TaskService.update with taskDto, taskId, and userId and return the updated task', async () => {
      const taskDto: Partial<TaskDto> = { name: 'Updated Task' }
      const updatedTask = { ...mockTask, ...taskDto }
      jest.spyOn(service, 'update').mockResolvedValue(updatedTask)

      const result = await controller.update(taskDto, userId, taskId)

      expect(service.update).toHaveBeenCalledWith(taskDto, taskId, userId)
      expect(result).toEqual(updatedTask)
    })
  })

  describe('delete', () => {
    it('should call TaskService.delete with taskId and userId and return the result', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(mockTask)

      const result = await controller.delete(userId, taskId)

      expect(service.delete).toHaveBeenCalledWith(taskId, userId)
      expect(result).toEqual(mockTask)
    })
  })
})
