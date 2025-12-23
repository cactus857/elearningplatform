import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from './guards/authentication.guard'
import { TwoFactorAuthService } from './services/2fa.service'
import { SharedRoleRepository } from './repositories/shared-role-repo'
import { S3Service } from './services/s3.service'
import { RedisService } from './services/redis.service'
import { RateLimitGuard } from './guards/rate-limit.guard'

const sharedService = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  TwoFactorAuthService,
  SharedUserRepository,
  SharedRoleRepository,
  S3Service,
  RedisService,
]

@Global()
@Module({
  providers: [
    ...sharedService,
    RateLimitGuard,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedService,
  imports: [JwtModule],
})
export class SharedModule {}
