import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUserQuerySchema,
  GetUserResSchema,
  UpdateUserBodySchema,
} from './user.model'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'

export class GetUsersResDTO extends createZodDto(GetUserResSchema) {}
export class GetUsersQueryDTO extends createZodDto(GetUserQuerySchema) {}
export class GetUsersParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class CreateUserResDTO extends UpdateProfileResDTO {}
