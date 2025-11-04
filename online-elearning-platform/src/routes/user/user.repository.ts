import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserBodyType, GetUserQueryType, GetUserResType } from './user.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { Prisma } from '@prisma/client'

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetUserQueryType): Promise<GetUserResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const search = pagination.search?.trim()
    const role = pagination.role

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }
    if (role) {
      where.role = {
        name: role,
      }
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where,
      }),
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        include: {
          role: true,
        },
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

  create({ createdById, data }: { createdById: string | null; data: CreateUserBodyType }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
        deletedAt: null,
      },
    })
  }

  delete({ id, deletedById }: { id: string; deletedById: string }, isHard?: boolean): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id,
          },
        })
      : this.prismaService.user.update({
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
}
