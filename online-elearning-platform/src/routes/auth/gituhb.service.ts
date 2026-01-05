// src/routes/auth/github.service.ts
import { Injectable } from '@nestjs/common'
import { AuthRepository } from './auth.repository'
import { HashingService } from 'src/shared/services/hashing.service'
import { AuthService } from './auth.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role-repo'
import { v4 as uuidv4 } from 'uuid'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'

@Injectable()
export class GithubService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRepository: AuthRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly authService: AuthService,
  ) { }

  getAuthorizationURL({ userAgent, ip }: GoogleAuthStateType) {
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')

    const params = new URLSearchParams({
      client_id: envConfig.GITHUB_CLIENT_ID,
      redirect_uri: envConfig.GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
      state: stateString,
    })

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`
    return { url }
  }

  async githubCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'Unknown'
      let ip = 'Unknown'

      // Parse state
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          userAgent = clientInfo.userAgent
          ip = clientInfo.ip
        }
      } catch (err) {
        console.log('Error parsing state', err)
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: envConfig.GITHUB_CLIENT_ID,
          client_secret: envConfig.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: envConfig.GITHUB_REDIRECT_URI,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new Error(tokenData.error_description || 'Failed to get access token')
      }

      const accessToken = tokenData.access_token

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      const userData = await userResponse.json()

      // Get user emails
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      const emails = await emailResponse.json()
      const primaryEmail = emails.find((email: any) => email.primary)?.email || userData.email

      if (!primaryEmail) {
        throw new Error('No email found from GitHub')
      }

      // Check if user exists
      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: primaryEmail,
      })

      // Create user if not exists
      if (!user) {
        const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
        const randomPassword = uuidv4()
        const hashedPassword = await this.hashingService.hash(randomPassword)

        user = await this.authRepository.createUserIncludeRole({
          email: primaryEmail,
          password: hashedPassword,
          fullName: userData.name || userData.login || 'GitHub User',
          phoneNumber: '',
          roleId: clientRoleId,
          avatar: userData.avatar_url || null,
          status: 'ACTIVE', // GitHub verified email, so set status to ACTIVE
        })
      }

      // Create device and generate tokens
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      })

      const authTokens = await this.authService.genereateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })

      return authTokens
    } catch (error) {
      console.log('Error in githubCallback:', error)
      throw error
    }
  }
}
