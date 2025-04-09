import { IsNumber, IsOptional, Min } from 'class-validator'

export class PomodoroIntervalDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  work: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  break: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  count: number
  userId: string
}
