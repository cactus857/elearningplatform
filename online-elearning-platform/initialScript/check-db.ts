import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
prisma.$connect()

const main = async () => {
    console.log('Checking database...\n')

    // Check all users
    const users = await prisma.user.findMany({
        include: { role: true }
    })

    console.log('=== ALL USERS IN DATABASE ===')
    if (users.length === 0) {
        console.log('No users found!')
    } else {
        users.forEach((user, i) => {
            console.log(`\n[${i + 1}] ${user.email}`)
            console.log(`    Name: ${user.fullName}`)
            console.log(`    Role: ${user.role.name}`)
            console.log(`    Status: ${user.status}`)
        })
    }

    // Check roles
    const roles = await prisma.role.findMany()
    console.log('\n=== ALL ROLES ===')
    roles.forEach(role => {
        console.log(`- ${role.name}: ${role.description}`)
    })

    console.log('\n=== DATABASE URL ===')
    console.log(process.env.DATABASE_URL?.substring(0, 50) + '...')
}

main()
    .then(() => process.exit(0))
    .catch(console.error)
