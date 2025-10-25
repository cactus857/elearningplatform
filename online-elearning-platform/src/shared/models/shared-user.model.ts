import z from 'zod'
import { UserStatus } from '../constants/auth.constant'
import { RoleSchema } from './shared-role.model'
import { PermissionSchema } from './shared-permission.model'

export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().max(11).nullable(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]),
  totpSecret: z.string().nullable(),
  roleId: z.string(),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
})

export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
