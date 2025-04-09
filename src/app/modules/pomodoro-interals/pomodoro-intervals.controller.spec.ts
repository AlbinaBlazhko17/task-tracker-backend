import { Test, TestingModule } from '@nestjs/testing'

import { PomodoroIntervalsController } from './pomodoro-intervals.controller'
import { PomodoroIntervalsService } from './pomodoro-intervals.service'

describe('PomodoroIntervalsController', () => {
  let controller: PomodoroIntervalsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroIntervalsController],
      providers: [PomodoroIntervalsService]
    }).compile()

    controller = module.get<PomodoroIntervalsController>(
      PomodoroIntervalsController
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
