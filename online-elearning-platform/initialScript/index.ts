import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constants'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
prisma.$connect()

const hashingService = new HashingService()
const main = async () => {
  let rolesCreated = 0

  // Check if roles exist, if not create them
  const roleCount = await prisma.role.count()
  if (roleCount === 0) {
    const roles = await prisma.role.createMany({
      data: [
        {
          name: RoleName.Admin,
          description: 'Admin role',
        },
        {
          name: RoleName.Student,
          description: 'Student role',
        },
        {
          name: RoleName.Instructor,
          description: 'Instructor role (TEACHER)',
        },
      ],
    })
    rolesCreated = roles.count
    console.log(`Created ${rolesCreated} roles`)
  } else {
    console.log('Roles already exist, skipping role creation')
  }

  // Get admin role
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })

  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: envConfig.ADMIN_EMAIL,
    },
  })

  if (existingAdmin) {
    console.log(`Admin user already exists: ${existingAdmin.email}`)
    // Update admin to ACTIVE status if not already
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { status: 'ACTIVE' },
    })
    console.log('Admin user status updated to ACTIVE')
    return {
      createdRoleCount: rolesCreated,
      adminUser: existingAdmin,
    }
  }

  // Create admin user with ACTIVE status
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      fullName: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  })

  return {
    createdRoleCount: rolesCreated,
    adminUser,
  }
}

main()
  .then(({ adminUser, createdRoleCount }) => {
    console.log(`Created ${createdRoleCount} roles`)
    console.log(`Created admin user: ${adminUser.email} roles`)
  })
  .catch(console.error)
