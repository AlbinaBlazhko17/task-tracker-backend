import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UserDto {
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  name: string

  @MinLength(6, {
    message: 'Password must be at least 6 characters long'
  })
  @IsString()
  password: string
}
