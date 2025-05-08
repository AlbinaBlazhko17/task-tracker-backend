import { Response } from 'express'

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { UserService } from '../user/user.service'

import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let userService: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            getByEmail: jest.fn(),
            create: jest.fn(),
            getById: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signUp', () => {
    it('should throw BadRequestException if user already exists', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }

      await expect(service.signUp(authDto)).rejects.toThrow(BadRequestException)
    })

    it('should create a new user and return tokens', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(null)
      jest.spyOn(userService, 'create').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      jest.spyOn(jwtService, 'sign').mockReturnValue('token')

      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }

      const result = await service.signUp(authDto)

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        accessToken: 'token',
        refreshToken: 'token',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })

  describe('signIn', () => {
    it('should validate user and return tokens', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      jest.spyOn(jwtService, 'sign').mockReturnValue('token')
      jest
        .spyOn(service as any, 'validateUser')
        .mockResolvedValueOnce({ id: '1', email: 'test@test.com' })

      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }

      const result = await service.sigIn(authDto)

      expect(result).toEqual({
        id: '1',
        email: 'test@test.com',
        accessToken: 'token',
        refreshToken: 'token'
      })
    })
  })

  describe('signOut', () => {
    it('should throw UnauthorizedException if no refresh token is provided', async () => {
      const res = {} as Response

      await expect(service.signOut(res, undefined)).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should remove refresh token and return success message', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({ id: '1' })
      jest.spyOn(userService, 'getById').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        intervals: {
          work: 1,
          break: 1,
          count: 1
        },
        tasks: [
          {
            id: '1',
            name: 'Test Task',
            userId: '1',
            priority: 'high',
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })
      const res = { clearCookie: jest.fn() } as unknown as Response

      const result = await service.signOut(res, 'validRefreshToken')

      expect(res.clearCookie).toHaveBeenCalledWith(
        service.REFRESH_TOKEN_NAME,
        expect.any(Object)
      )
      expect(result).toEqual({ message: 'Logout successful' })
    })
  })

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new UnauthorizedException())

      await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should return new tokens if refresh token is valid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({ id: '1' })
      jest.spyOn(userService, 'getById').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        intervals: {
          work: 1,
          break: 1,
          count: 1
        },
        tasks: [
          {
            id: '1',
            name: 'Test Task',
            userId: '1',
            priority: 'high',
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })
      jest.spyOn(jwtService, 'sign').mockReturnValue('newToken')

      const result = await service.refreshTokens('validToken')

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        accessToken: 'newToken',
        refreshToken: 'newToken',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        intervals: {
          work: 1,
          break: 1,
          count: 1
        },
        tasks: [
          {
            id: '1',
            name: 'Test Task',
            userId: '1',
            priority: 'high',
            isCompleted: false,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          }
        ]
      })
    })
  })

  describe('validateUser', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(null)

      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }

      await expect(service['validateUser'](authDto)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('argon2'), 'verify').mockResolvedValueOnce(false)

      const authDto: AuthDto = {
        email: 'test@test.com',
        password: 'wrongPassword'
      }

      await expect(service['validateUser'](authDto)).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should return user without password if validation succeeds', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('argon2'), 'verify').mockResolvedValueOnce(true)

      const authDto: AuthDto = { email: 'test@test.com', password: 'password' }

      const result = await service['validateUser'](authDto)

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })
  })
})
