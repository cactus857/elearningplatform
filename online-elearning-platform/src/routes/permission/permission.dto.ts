import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionBodySchema,
  GetModulesPermissionResSchema,
  GetPermissionDetailResSchema,
  GetPermissionQuerySchema,
  GetPermissionsParamsSchema,
  GetPermissionsResSchema,
  UpdatePermissionBodySchema,
} from './permission.model'

export class GetPermissionResDTO extends createZodDto(GetPermissionsResSchema) {}

export class GetPermissionParamsDTO extends createZodDto(GetPermissionsParamsSchema) {}

export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class GetPermissionQueryDTO extends createZodDto(GetPermissionQuerySchema) {}

export class GetModulesPermissionResDTO extends createZodDto(GetModulesPermissionResSchema) {}
