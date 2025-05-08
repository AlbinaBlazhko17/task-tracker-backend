import { mockDeep } from 'jest-mock-extended'

import { Test, TestingModule } from '@nestjs/testing'

import { PrismaClient } from '@prisma/client'

import { UserDto } from './dto/user.dto'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { PrismaService } from '@/core/prisma/prisma.service'

describe('UserController', () => {
  let controller: UserController

  const mockUserService = {
    getProfile: jest.fn(),
    update: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        PrismaService,
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile()

    controller = module.get<UserController>(UserController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '123'
      const mockProfile = { id: userId, name: 'John Doe' }
      mockUserService.getProfile.mockResolvedValue(mockProfile)

      const result = await controller.getProfile(userId)

      expect(result).toEqual(mockProfile)
      expect(mockUserService.getProfile).toHaveBeenCalledWith(userId)
    })
  })

  describe('updateProfile', () => {
    it('should update and return the updated user profile', async () => {
      const userId = '123'
      const userDto: Partial<UserDto> = { name: 'Updated Name' }
      const updatedProfile = { id: userId, ...userDto }
      mockUserService.update.mockResolvedValue(updatedProfile)

      const result = await controller.updateProfile(userId, userDto)

      expect(result).toEqual(updatedProfile)
      expect(mockUserService.update).toHaveBeenCalledWith(userId, userDto)
    })

    it('should throw an error if update fails', async () => {
      const userId = '123'
      const userDto: Partial<UserDto> = { name: 'Updated Name' }
      mockUserService.update.mockRejectedValue(new Error('Update failed'))

      await expect(controller.updateProfile(userId, userDto)).rejects.toThrow(
        'Update failed'
      )
      expect(mockUserService.update).toHaveBeenCalledWith(userId, userDto)
    })
  })
})
