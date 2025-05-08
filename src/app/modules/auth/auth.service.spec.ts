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
import { removePassword } from '@/utils/helpers/remove-password.helper'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let userService: UserService

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockUserWithDetails = {
    ...mockUser,
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
        priority: 'high' as const,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  const mockAuthDto: AuthDto = { email: 'test@test.com', password: 'password' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
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
    it('should throw BadRequestException when user with email already exists', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(mockUser)

      await expect(service.signUp(mockAuthDto)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should create a new user and return user info with tokens', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(null)
      jest.spyOn(userService, 'create').mockResolvedValueOnce(mockUser)

      const result = await service.signUp(mockAuthDto)

      expect(result).toEqual(
        removePassword({
          ...mockUser,
          accessToken: 'token',
          refreshToken: 'token'
        })
      )
    })
  })

  describe('signIn', () => {
    it('should validate credentials and return user info with tokens', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(mockUser)
      jest
        .spyOn(service as any, 'validateUser')
        .mockResolvedValueOnce({ id: '1', email: 'test@test.com' })

      const result = await service.sigIn(mockAuthDto)

      expect(result).toEqual({
        id: '1',
        email: 'test@test.com',
        accessToken: 'token',
        refreshToken: 'token'
      })
    })
  })

  describe('signOut', () => {
    it('should throw UnauthorizedException when no refresh token is provided', async () => {
      const res = {} as Response

      await expect(service.signOut(res, undefined)).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should clear refresh token cookie and return success message', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({ id: '1' })
      jest
        .spyOn(userService, 'getById')
        .mockResolvedValueOnce(mockUserWithDetails)

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
    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new UnauthorizedException())

      await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should return new tokens and user info when refresh token is valid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({ id: '1' })
      jest
        .spyOn(userService, 'getById')
        .mockResolvedValueOnce(mockUserWithDetails)
      jest.spyOn(jwtService, 'sign').mockReturnValue('newToken')

      const result = await service.refreshTokens('validToken')

      expect(result).toEqual(
        removePassword({
          ...mockUserWithDetails,
          accessToken: 'newToken',
          refreshToken: 'newToken'
        })
      )
    })
  })

  describe('validateUser', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(null)

      await expect(service['validateUser'](mockAuthDto)).rejects.toThrow(
        NotFoundException
      )
    })

    it('should throw UnauthorizedException when password is incorrect', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(mockUser)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('argon2'), 'verify').mockResolvedValueOnce(false)

      await expect(service['validateUser'](mockAuthDto)).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('should return user without password when credentials are valid', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValueOnce(mockUser)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('argon2'), 'verify').mockResolvedValueOnce(true)

      const result = await service['validateUser'](mockAuthDto)

      expect(result).toEqual(removePassword(mockUser))
    })
  })
})
