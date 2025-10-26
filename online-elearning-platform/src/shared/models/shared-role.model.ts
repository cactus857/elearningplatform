import z from 'zod'
import { PermissionSchema } from './shared-permission.model'

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string().max(500),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  deletedById: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const RolePermssionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})

export type RoleType = z.infer<typeof RoleSchema>
export type RolePermssionsType = z.infer<typeof RolePermssionsSchema>
