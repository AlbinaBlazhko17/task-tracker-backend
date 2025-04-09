import { Test, TestingModule } from '@nestjs/testing'

import { PomodoroIntervalsService } from './pomodoro-intervals.service'

describe('PomodoroIntervalsService', () => {
  let service: PomodoroIntervalsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PomodoroIntervalsService]
    }).compile()

    service = module.get<PomodoroIntervalsService>(PomodoroIntervalsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
