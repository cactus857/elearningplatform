import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
prisma.$connect()

const main = async () => {
    // Get user with all fields
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@gmail.com' },
    })

    console.log('=== USER DETAILS ===')
    console.log(JSON.stringify(user, null, 2))

    // Fix if deletedAt is set
    if (user && user.deletedAt !== null) {
        console.log('\n⚠️ User has deletedAt set! Fixing...')
        await prisma.user.update({
            where: { email: 'superadmin@gmail.com' },
            data: { deletedAt: null }
        })
        console.log('✅ Fixed! deletedAt set to null')
    }
}

main()
    .then(() => process.exit(0))
    .catch(console.error)
