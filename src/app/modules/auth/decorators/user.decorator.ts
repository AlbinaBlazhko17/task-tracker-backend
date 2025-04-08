import { type ExecutionContext, createParamDecorator } from '@nestjs/common'

import { User } from '@prisma/client'

export const CurrentUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    if (data) {
      return user[data]
    }

    return user
  }
)
