import { Request, Response } from 'express'

import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  const authDto: AuthDto = { email: 'test@test.com', password: 'password' }
  const mockUserResponse = {
    refreshToken: 'mockRefreshToken',
    accessToken: 'mockAccessToken',
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    intervals: null,
    tasks: []
  }

  const expectedClientResponse = {
    id: mockUserResponse.id,
    name: mockUserResponse.name,
    email: mockUserResponse.email,
    accessToken: mockUserResponse.accessToken,
    createdAt: mockUserResponse.createdAt,
    updatedAt: mockUserResponse.updatedAt
  }

  const expectedSignInResponse = {
    ...expectedClientResponse,
    intervals: mockUserResponse.intervals,
    tasks: mockUserResponse.tasks
  }

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  } as unknown as Response

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            sigIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            refreshTokens: jest.fn(),
            addRefreshTokenToResponse: jest.fn(),
            removeRefreshTokenFromResponse: jest.fn(),
            REFRESH_TOKEN_NAME: 'refreshToken'
          }
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('signIn', () => {
    it('should call AuthService.signIn and return user data', async () => {
      jest.spyOn(service, 'sigIn').mockResolvedValue(mockUserResponse)

      const result = await controller.sigIn(authDto, mockResponse)

      expect(service.sigIn).toHaveBeenCalledWith(authDto)
      expect(result).toEqual(expectedSignInResponse)
    })
  })

  describe('signUp', () => {
    it('should call AuthService.signUp and return user data', async () => {
      jest.spyOn(service, 'signUp').mockResolvedValue(mockUserResponse)

      const result = await controller.signUp(authDto, mockResponse)

      expect(service.signUp).toHaveBeenCalledWith(authDto)
      expect(result).toEqual(expectedSignInResponse)
    })
  })

  describe('signOut', () => {
    it('should call AuthService.signOut', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'mockRefreshToken' }
      } as unknown as Request

      jest.spyOn(service, 'signOut').mockResolvedValue({
        message: 'Signed out successfully'
      })

      await controller.signOut(mockRequest, mockResponse)

      expect(service.signOut).toHaveBeenCalledWith(
        mockResponse,
        'mockRefreshToken'
      )
    })
  })

  describe('refreshTokens', () => {
    it('should call AuthService.refreshTokens and return new tokens', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'mockRefreshToken' }
      } as unknown as Request

      const mockTokensResponse = {
        ...mockUserResponse,
        refreshToken: 'newMockRefreshToken',
        accessToken: 'newMockAccessToken'
      }

      jest.spyOn(service, 'refreshTokens').mockResolvedValue(mockTokensResponse)

      const result = await controller.refreshTokens(mockRequest, mockResponse)

      expect(service.refreshTokens).toHaveBeenCalledWith('mockRefreshToken')
      expect(result).toEqual({
        ...expectedClientResponse,
        accessToken: mockTokensResponse.accessToken,
        intervals: mockTokensResponse.intervals,
        tasks: mockTokensResponse.tasks
      })
    })
  })
})
