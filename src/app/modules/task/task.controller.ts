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

import { TaskDto } from './dto/task.dto'
import { TaskService } from './task.service'

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Auth()
  async getAllTasks(@CurrentUser('id') userId: string) {
    return this.taskService.getAll(userId)
  }

  @HttpCode(200)
  @Post()
  @Auth()
  async create(@Body() taskDto: TaskDto, @CurrentUser('id') userId: string) {
    return this.taskService.create(userId, taskDto)
  }

  @HttpCode(200)
  @Patch(':id')
  @Auth()
  async update(
    @Body() taskDto: Partial<TaskDto>,
    @CurrentUser('id') userId: string,
    @Param('id') taskId: string
  ) {
    return this.taskService.update(taskDto, taskId, userId)
  }

  @Delete(':id')
  @Auth()
  async delete(@CurrentUser('id') userId: string, @Param('id') taskId: string) {
    return this.taskService.delete(taskId, userId)
  }
}
