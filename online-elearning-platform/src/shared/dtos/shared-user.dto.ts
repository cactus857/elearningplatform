import { createZodDto } from 'nestjs-zod'
import { GetUserProfileResSchema, UpdateProfileResSchema } from '../models/shared-user.model'

// Ap dung cho api GET('profile) va GET('users/:userId')
export class GetUserProfileResDTO extends createZodDto(GetUserProfileResSchema) {}

export class UpdateProfileResDTO extends createZodDto(UpdateProfileResSchema) {}
