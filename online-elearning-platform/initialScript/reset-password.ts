import { RoleName } from 'src/shared/constants/role.constants'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
prisma.$connect()

const hashingService = new HashingService()

// Admin credentials 
const ADMIN_EMAIL = 'superadmin@gmail.com'
const ADMIN_PASSWORD = 'password123'

const main = async () => {
    console.log('Resetting admin password...')

    // Hash the password
    const hashedPassword = await hashingService.hash(ADMIN_PASSWORD)
    console.log('New hashed password created')

    // Update user password
    const updatedUser = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
            password: hashedPassword,
            status: 'ACTIVE'
        },
    })

    console.log('========================================')
    console.log('✅ Password reset successfully!')
    console.log('========================================')
    console.log(`Email:    ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log(`Status:   ${updatedUser.status}`)
    console.log('========================================')

    // Test the password hash
    const isMatch = await hashingService.compare(ADMIN_PASSWORD, hashedPassword)
    console.log(`Password verify test: ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`)
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error:', err)
        process.exit(1)
    })
