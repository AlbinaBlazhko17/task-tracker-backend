import { Test, TestingModule } from '@nestjs/testing'

import { TaskDto } from './dto/task.dto'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

describe('TaskController', () => {
  let controller: TaskController
  let service: TaskService

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
      const userId = '123'
      const tasks = [
        {
          id: '1',
          name: 'Test Task',
          priority: 'high' as const,
          userId,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      jest.spyOn(service, 'getAll').mockResolvedValue(tasks)

      const result = await controller.getAllTasks(userId)

      expect(service.getAll).toHaveBeenCalledWith(userId)
      expect(result).toEqual(tasks)
    })
  })

  describe('create', () => {
    it('should call TaskService.create with userId and taskDto and return the created task', async () => {
      const userId = '123'
      const taskDto: TaskDto = {
        name: 'New Task',
        priority: 'high' as const,
        isCompleted: false
      }
      const createdTask = {
        id: '1',
        ...taskDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'create').mockResolvedValue(createdTask)

      const result = await controller.create(taskDto, userId)

      expect(service.create).toHaveBeenCalledWith(userId, taskDto)
      expect(result).toEqual(createdTask)
    })
  })

  describe('update', () => {
    it('should call TaskService.update with taskDto, taskId, and userId and return the updated task', async () => {
      const userId = '123'
      const taskId = '1'
      const taskDto: Partial<TaskDto> = { name: 'Updated Task' }
      const updatedTask = {
        id: taskId,
        name: 'Updated Task',
        isCompleted: false,
        priority: 'high' as const,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'update').mockResolvedValue(updatedTask)

      const result = await controller.update(taskDto, userId, taskId)

      expect(service.update).toHaveBeenCalledWith(taskDto, taskId, userId)
      expect(result).toEqual(updatedTask)
    })
  })

  describe('delete', () => {
    it('should call TaskService.delete with taskId and userId and return the result', async () => {
      const userId = '123'
      const taskId = '1'
      const deleteResult = {
        id: taskId,
        name: 'Test Task',
        priority: 'high' as const,
        userId,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'delete').mockResolvedValue(deleteResult)

      const result = await controller.delete(userId, taskId)

      expect(service.delete).toHaveBeenCalledWith(taskId, userId)
      expect(result).toEqual(deleteResult)
    })
  })
})
