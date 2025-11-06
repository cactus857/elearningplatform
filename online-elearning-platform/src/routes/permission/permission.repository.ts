import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreatePermissionBodyType,
  GetModulesPermissionResType,
  GetPermissionQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model'
import { Prisma } from '@prisma/client'

@Injectable()
export class PermissionRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetPermissionQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const module = pagination.module

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
    }
    if (module) {
      where.module = module
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where,
      }),
      this.prismaService.permission.findMany({
        where,
        skip,
        take,
      }),
    ])
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  findById(id: string): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: string | null
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
        deletedAt: null,
      },
    })
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string
    updatedById: string
    data: UpdatePermissionBodyType
  }): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete({ id, deletedById }: { id: string; deletedById: string }, isHard?: boolean): Promise<PermissionType> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        })
  }

  async listModules(): Promise<GetModulesPermissionResType> {
    const modules = await this.prismaService.permission.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        module: true,
      },
      distinct: ['module'],
      orderBy: { module: 'asc' },
    })

    return { data: modules.map((mod) => ({ module: mod.module })) }
  }
}
