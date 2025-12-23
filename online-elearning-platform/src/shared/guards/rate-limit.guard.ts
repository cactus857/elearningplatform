import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RedisService } from '../services/redis.service'
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator'

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy config từ decorator
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // Không có decorator → không limit
    if (!rateLimitOptions) {
      return true
    }

    // 2. Lấy thông tin request
    const request = context.switchToHttp().getRequest()
    const ip = this.getClientIp(request)
    const endpoint = request.route?.path || request.url
    const endpointPath = endpoint.substring(1)

    // 3. Tạo key: ratelimit:{endpoint}:{ip}
    const keyPrefix = rateLimitOptions.keyPrefix || endpointPath.replace(/\//g, ':')
    const key = `${keyPrefix}:${ip}`

    // 4. Check và increment count
    const { count, ttl } = await this.incrementAndGetCount(key, rateLimitOptions.windowSeconds)

    // 5. Set response headers
    const response = context.switchToHttp().getResponse()
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.limit)
    response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.limit - count))
    response.setHeader('X-RateLimit-Reset', ttl)

    // 6. Check limit
    if (count > rateLimitOptions.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: ttl,
          limit: rateLimitOptions.limit,
          remaining: 0,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    return true
  }

  private getClientIp(request: any): string {
    // Lấy IP từ các headers (nếu có proxy/load balancer)
    const forwarded = request.headers['x-forwarded-for']
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    return (
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    )
  }

  private async incrementAndGetCount(
    key: string,
    windowSeconds: number,
  ): Promise<{ count: number; ttl: number }> {
    const count = await this.redisService.incrementRateLimit(key, windowSeconds)
    const ttl = await this.redisService.getTTL(key)

    return { count, ttl: ttl > 0 ? ttl : windowSeconds }
  }
}