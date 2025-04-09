import { Module } from '@nestjs/common'

import { PomodoroIntervalsController } from './pomodoro-intervals.controller'
import { PomodoroIntervalsService } from './pomodoro-intervals.service'

@Module({
  controllers: [PomodoroIntervalsController],
  providers: [PomodoroIntervalsService]
})
export class PomodoroIntervalsModule {}
