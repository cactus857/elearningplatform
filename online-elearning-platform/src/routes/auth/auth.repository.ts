import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DeviceType, RefreshTokenType, RegisterBodyType, VerificationCodeType } from './auth.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { RefreshToken } from '@prisma/client'
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo'
import { RoleType } from 'src/shared/models/shared-role.model'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'> & Partial<Pick<UserType, 'status'>>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: {
        ...user,
        deletedAt: null,
      },
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createUserIncludeRole(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId' | 'avatar'> & Partial<Pick<UserType, 'status'>>,
  ): Promise<UserType & { role: RoleType }> {
    return await this.prismaService.user.create({
      data: {
        ...user,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    })
  }

  async createVerficationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: payload.email,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findUniqueVerficationCode(
    uniqueValue:
      | { id: string }
      | {
        email_type: {
          email: string
          type: TypeOfVerificationCodeType
        }
      },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }

  createRefreshToken(data: { token: string; userId: string; expiresAt: Date; deviceId: string }) {
    return this.prismaService.refreshToken.create({
      data,
    })
  }

  createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({
      data,
    })
  }

  async findUniqueUserIncludeRole(where: WhereUniqueUserType): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findFirst({
      where: { ...where, deletedAt: null },
      include: {
        role: true,
      },
    })
  }

  async findUniqueRefreshTokenIncludeUserRole(where: {
    token: string
  }): Promise<(RefreshToken & { user: UserType & { role: RoleType } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    })
  }

  updateDevice(deviceId: string, data: Partial<DeviceType>) {
    return this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    })
  }

  deleteRefreshToken(where: { token: string }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where,
    })
  }

  // updateUser(where: { id: string } | { email: string }, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
  //   return this.prismaService.user.update({
  //     where,
  //     data,
  //   })
  // }

  deleteVerificationCode(
    uniqueValue:
      | { id: string }
      | {
        email_type: {
          email: string
          type: TypeOfVerificationCodeType
        }
      },
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: uniqueValue,
    })
  }
}
