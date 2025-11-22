import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  DisableTwoFactorBodyDTO,
  EnableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
  UserProfileResDTO,
} from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GoogleService } from './google.service'
import express from 'express'
import envConfig from 'src/shared/config'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GithubService } from './gituhb.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
    private readonly githubService: GithubService,
  ) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('otp')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Get('/me')
  @ZodSerializerDto(UserProfileResDTO)
  me(@ActiveUser('userId') userId: string) {
    return this.authService.me({
      id: userId,
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  // -------------Google OAuth Routes----------

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getAuthorizationURL(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationURL({ userAgent, ip })
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: express.Response) {
    try {
      const data = await this.googleService.googleCallback({ code, state })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login with Google'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }

  // -------------Github OAuth Routes----------
  // ===== GITHUB OAUTH =====
  @Get('github-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getGithubAuthorizationURL(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.githubService.getAuthorizationURL({ userAgent, ip })
  }

  @Get('github/callback')
  @IsPublic()
  async githubCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: express.Response) {
    try {
      const data = await this.githubService.githubCallback({ code, state })
      return res.redirect(
        `${envConfig.GITHUB_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login with GitHub'
      return res.redirect(`${envConfig.GITHUB_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  setupTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: string) {
    return this.authService.setupTwoFactorAuth(userId)
  }

  @Post('2fa/enable')
  @ZodSerializerDto(MessageResDTO)
  enableTwoFactorAuth(@Body() body: EnableTwoFactorBodyDTO, @ActiveUser('userId') userId: string) {
    return this.authService.enableTwoFactorAuth({
      ...body,
      userId,
    })
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: string) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId,
    })
  }
}
