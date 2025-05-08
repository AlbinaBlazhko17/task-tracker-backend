import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

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
    it('should call AuthService.sigIn and return user data', async () => {
      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }
      const mockResponse = {
        refreshToken: 'mockRefreshToken',
        accessToken: 'mockAccessToken',
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'sigIn').mockResolvedValue(mockResponse)

      const result = await controller.sigIn(authDto, {} as any)

      expect(service.sigIn).toHaveBeenCalledWith(authDto)
      expect(result).toEqual({
        id: mockResponse.id,
        name: mockResponse.name,
        email: mockResponse.email,
        accessToken: mockResponse.accessToken,
        createdAt: mockResponse.createdAt,
        updatedAt: mockResponse.updatedAt
      })
    })
  })

  describe('signUp', () => {
    it('should call AuthService.signUp and return user data', async () => {
      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }
      const mockResponse = {
        refreshToken: 'mockRefreshToken',
        accessToken: 'mockAccessToken',
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest.spyOn(service, 'signUp').mockResolvedValue(mockResponse)

      const result = await controller.signUp(authDto, {} as any)

      expect(service.signUp).toHaveBeenCalledWith(authDto)
      expect(result).toEqual({
        id: mockResponse.id,
        name: mockResponse.name,
        email: mockResponse.email,
        accessToken: mockResponse.accessToken,
        createdAt: mockResponse.createdAt,
        updatedAt: mockResponse.updatedAt
      })
    })
  })

  describe('signOut', () => {
    it('should call AuthService.signOut', async () => {
      const mockRequest = {
        cookies: { refreshToken: 'mockRefreshToken' }
      } as any
      const mockResponse = {} as any
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
      } as any
      const mockResponse = {} as any
      const mockTokens = {
        refreshToken: 'newMockRefreshToken',
        accessToken: 'newMockAccessToken',
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        intervals: null,
        tasks: []
      }
      jest.spyOn(service, 'refreshTokens').mockResolvedValue(mockTokens)

      const result = await controller.refreshTokens(mockRequest, mockResponse)

      expect(service.refreshTokens).toHaveBeenCalledWith('mockRefreshToken')
      expect(result).toEqual({
        id: mockTokens.id,
        name: mockTokens.name,
        email: mockTokens.email,
        accessToken: mockTokens.accessToken,
        createdAt: mockTokens.createdAt,
        updatedAt: mockTokens.updatedAt,
        intervals: mockTokens.intervals,
        tasks: mockTokens.tasks
      })
    })
  })
})
