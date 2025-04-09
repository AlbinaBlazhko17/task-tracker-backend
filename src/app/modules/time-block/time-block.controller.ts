import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put
} from '@nestjs/common'

import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

import { TimeBlockDto } from './dto/time-block.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { TimeBlockService } from './time-block.service'

@Controller('time-block')
export class TimeBlockController {
  constructor(private readonly timeBlockService: TimeBlockService) {}

  @Get()
  @Auth()
  async findAll(@CurrentUser('id') userId: string) {
    return this.timeBlockService.findAll(userId)
  }

  @HttpCode(200)
  @Post()
  @Auth()
  async create(
    @Body() timeBlockDto: TimeBlockDto,
    @CurrentUser('id') userId: string
  ) {
    return this.timeBlockService.create(timeBlockDto, userId)
  }

  @HttpCode(200)
  @Patch(':id')
  @Auth()
  async update(
    @Body() timeBlockDto: Partial<TimeBlockDto>,
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return this.timeBlockService.update(id, timeBlockDto, userId)
  }

  @Delete(':id')
  @Auth()
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.timeBlockService.delete(id, userId)
  }

  @HttpCode(200)
  @Put('update-order')
  @Auth()
  async updateOrder(@Body() updateOrderDto: UpdateOrderDto) {
    return this.timeBlockService.updateOrder(updateOrderDto.ids)
  }
}
