import { Controller } from '@nestjs/common'

import { PomodoroIntervalsService } from './pomodoro-intervals.service'

@Controller('pomodoro-intervals')
export class PomodoroIntervalsController {
  constructor(
    private readonly pomodoroIntervalsService: PomodoroIntervalsService
  ) {}
}
