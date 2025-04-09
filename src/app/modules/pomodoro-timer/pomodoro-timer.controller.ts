import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post
} from '@nestjs/common'

import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

import { PomodoroRoundDto } from './dto/pomodoro-round.dto'
import { PomodoroTimerService } from './pomodoro-timer.service'

@Controller('pomodoro-timer')
export class PomodoroTimerController {
  constructor(private readonly pomodoroTimerService: PomodoroTimerService) {}

  @Get('today')
  @Auth()
  async getTodaySession(@CurrentUser('id') userId: string) {
    return this.pomodoroTimerService.getTodaySession(userId)
  }

  @HttpCode(200)
  @Post()
  @Auth()
  async create(@CurrentUser('id') userId: string) {
    return this.pomodoroTimerService.create(userId)
  }

  @HttpCode(200)
  @Patch('round/:id')
  @Auth()
  async updateRound(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() pomodoroRoundDto: PomodoroRoundDto
  ) {
    return this.pomodoroTimerService.updateRound(id, pomodoroRoundDto, userId)
  }

  @HttpCode(200)
  @Patch(':id')
  @Auth()
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() pomodoroRoundDto: Partial<PomodoroRoundDto>
  ) {
    return this.pomodoroTimerService.update(id, pomodoroRoundDto, userId)
  }

  @HttpCode(200)
  @Delete(':id')
  @Auth()
  async deleteSession(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return this.pomodoroTimerService.deleteSession(id, userId)
  }
}
