import { NotFoundException } from '@nestjs/common'

export const NotFoundRecordException = new NotFoundException('Record not found')
