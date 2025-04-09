import { Module } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { PomodoroTimerController } from './pomodoro-timer.controller'
import { PomodoroTimerService } from './pomodoro-timer.service'

@Module({
  imports: [UserModule],
  controllers: [PomodoroTimerController],
  providers: [PomodoroTimerService]
})
export class PomodoroTimerModule {}
