import { IsBoolean, IsNumber, IsOptional } from 'class-validator'

export class PomodoroRoundDto {
  @IsNumber()
  totalSeconds: number

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean
}
