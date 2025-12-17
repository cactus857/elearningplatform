import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
prisma.$connect()

const main = async () => {
    const roles = await prisma.role.findMany()
    console.log('=== ROLES ===')
    console.log(JSON.stringify(roles, null, 2))

    // Get the user and their role
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@gmail.com' },
        include: { role: true }
    })

    console.log('\n=== SUPERADMIN USER WITH ROLE ===')
    console.log(JSON.stringify(user, null, 2))
}

main()
    .then(() => process.exit(0))
    .catch(console.error)
