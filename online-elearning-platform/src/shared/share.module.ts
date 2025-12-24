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
import { ElasticsearchService } from './services/elasticsearch.service'
import { ElasticsearchModule } from '@nestjs/elasticsearch'
import envConfig from './config'

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
  ElasticsearchService,
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
  imports: [JwtModule,
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        cloud:{id: envConfig.ELASTICSEARCH_CLOUD_ID},
        auth: {
          username: envConfig.ELASTICSEARCH_USERNAME,
          password: envConfig.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
  ],
})
export class SharedModule {}
