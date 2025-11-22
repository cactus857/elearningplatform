import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthRepository } from './auth.repository'
import { GoogleService } from './google.service'
import { GithubService } from './gituhb.service'

@Module({
  providers: [AuthService, AuthRepository, GoogleService, GithubService],
  controllers: [AuthController],
})
export class AuthModule {}
