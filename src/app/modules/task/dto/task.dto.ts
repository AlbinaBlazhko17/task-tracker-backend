import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'

import { Priority } from '@prisma/client'

export class TaskDto {
  @IsString()
  name: string

  @IsString()
  @IsEnum(Priority)
  @Transform(({ value }) => ('' + value).toLowerCase())
  priority: Priority

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean
}
