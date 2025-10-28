import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from '../constants/auth.constant'
import { AccessTokenPayload } from '../types/jwt.type'
import { PrismaService } from '../services/prisma.service'
import { HTTPMethod } from '../constants/role.constants'

const WHITELISTED_ROUTES = [
  {
    path: '/profile',
    method: 'GET',
  },
  {
    path: '/auth/me',
    method: 'GET',
  },
  {
    path: '/auth/logout',
    method: 'POST',
  },
]

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // Extract va validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    const currentPath = request.route.path
    const currentMethod = request.method

    const isWhitelisted = WHITELISTED_ROUTES.some(
      (route) => route.path === currentPath && route.method === currentMethod,
    )

    if (isWhitelisted) {
      return true
    }

    // check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTolenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  private extractAccessTolenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) throw new UnauthorizedException()
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId: string = decodedAccessToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException()
      })
    console.log(role.permissions)
    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      console.log('>>>>canAcess', canAccess)
      throw new ForbiddenException()
    }
    request[REQUEST_ROLE_PERMISSIONS] = role
  }
}
