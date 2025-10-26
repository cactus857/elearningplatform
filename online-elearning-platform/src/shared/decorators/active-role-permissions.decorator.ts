import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS } from '../constants/auth.constant'
import { RolePermssionsType } from '../models/shared-role.model'

export const ActiveRolePermissions = createParamDecorator(
  (field: keyof RolePermssionsType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const user: RolePermssionsType | undefined = request[REQUEST_ROLE_PERMISSIONS]
    return field ? user?.[field] : user
  },
)
