import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserRepository } from './user.repository'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role-repo'
import { CreateUserBodyType, GetUserQueryType, UpdateUserBodyType } from './user.model'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constants'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helper'
import { CannotUpdateOrDeleteYourselfException, RoleNotFoundException, UserAlreadyExistsException } from './user.error'
import { string } from 'zod'

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private hashingService: HashingService,
    private sharedUserRepository: SharedUserRepository,
    private sharedRoleRepository: SharedRoleRepository,
  ) {}

  /**
   *
   * Function kiem tra xem nguoi thuc hien co quyen tac dong user khac hay khong.
   * Vi chi co nguoi thuc hien la admin role moi co quyen: Tao admin user, update roleId thanh admin, xoa admin user
   * Con neu khpng phai la admin thi khong duoc phep tac dong den admin
   */
  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    // Agent la admin thi cho phep
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      // Agent kh phai admin thi roleIdTarget phai khac Admin
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) throw new ForbiddenException()

      return true
    }
  }

  private async getRoleIdByUserId(userId: string) {
    const currentUser = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!currentUser) throw NotFoundRecordException
  }

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: string; userTargetId: string }) {
    if (userAgentId === userTargetId) throw CannotUpdateOrDeleteYourselfException
  }

  list(pagination: GetUserQueryType) {
    return this.userRepository.list(pagination)
  }

  async findById(id: string) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id,
    })
    if (!user) throw NotFoundRecordException

    return user
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType
    createdById: string
    createdByRoleName: string
  }) {
    try {
      // chi co admin agent moi co quyen tao user voi role la admin
      await this.verifyRole({ roleNameAgent: createdByRoleName, roleIdTarget: data.roleId })

      const hashedPassword = await this.hashingService.hash(data.password)

      const user = await this.userRepository.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword,
        },
      })

      return user
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) throw RoleNotFoundException

      if (isUniqueConstraintPrismaError(error)) throw UserAlreadyExistsException

      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: string
    data: UpdateUserBodyType
    updatedById: string
    updatedByRoleName: string
  }) {
    try {
      // khong the cap nhat chinh minh
      this.verifyYourself({ userAgentId: updatedById, userTargetId: id })

      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({ roleIdTarget, roleNameAgent: updatedByRoleName })

      const updateUser = await this.sharedUserRepository.update(
        {
          id,
        },
        {
          ...data,
          updatedById,
          updatedAt: new Date(),
        },
      )

      return updateUser
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException

      if (isUniqueConstraintPrismaError(error)) throw UserAlreadyExistsException

      if (isForeignKeyConstraintPrismaError(error)) throw RoleNotFoundException

      throw error
    }
  }

  async delete({ id, deletedById, deletedByRoleName }: { id: string; deletedById: string; deletedByRoleName: string }) {
    try {
      // khong the xoa chinh minh
      this.verifyYourself({ userAgentId: deletedById, userTargetId: id })

      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.verifyRole({ roleIdTarget, roleNameAgent: deletedByRoleName })

      await this.userRepository.delete({
        id,
        deletedById,
      })

      return {
        message: 'Delete user successfully!',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException

      throw error
    }
  }
}
