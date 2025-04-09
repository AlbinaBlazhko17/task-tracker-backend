import { IsBoolean, IsEnum, IsString } from 'class-validator'

import { Priority } from '@prisma/client'

export class TaskDto {
  @IsString()
  name: string

  @IsString()
  @IsEnum(Priority)
  priority: Priority

  @IsBoolean()
  isCompleted: boolean

  @IsString()
  userId: string
}
