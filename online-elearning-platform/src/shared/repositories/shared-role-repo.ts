import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constants'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from '../models/shared-role.model'

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: string | null = null
  private adminRoleId: string | null = null
  private instructorId: string | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string): Promise<RoleType> {
    const role = await this.prismaService.role.findUniqueOrThrow({
      where: {
        name: roleName,
        deletedAt: null,
      },
    })

    return role
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    const role = await this.getRole(RoleName.Student)

    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.Admin)

    this.adminRoleId = role.id
    return role.id
  }

  async getInstructorRoleId() {
    if (this.instructorId) {
      return this.instructorId
    }
    const role = await this.getRole(RoleName.Instructor)

    this.instructorId = role.id
    return role.id
  }
}
