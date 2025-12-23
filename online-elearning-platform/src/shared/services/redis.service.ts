import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_KEY_PREFIX, REDIS_TTL } from '../constants/redis.constant'
import * as crypto from 'crypto'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value)
    } else {
      await this.redis.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  // TOKEN BLACKLIST METHODS
  /**
   * Hash token để không lưu plain token trong Redis
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  /**
   * Thêm token vào blacklist khi logout
   * @param token - Access token cần blacklist
   * @param ttlSeconds - Thời gian sống (default = 1 hour)
   */
  async addToBlacklist(token: string, ttlSeconds: number = REDIS_TTL.ACCESS_TOKEN): Promise<void> {
    const hashedToken = this.hashToken(token)
    const key = `${REDIS_KEY_PREFIX.TOKEN_BLACKLIST}${hashedToken}`
    await this.redis.setex(key, ttlSeconds, '1')
  }

  /**
   * Kiểm tra token có trong blacklist không
   * @param token - Access token cần check
   * @returns true nếu token bị blacklist (đã logout)
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const hashedToken = this.hashToken(token)
    const key = `${REDIS_KEY_PREFIX.TOKEN_BLACKLIST}${hashedToken}`
    return this.exists(key)
  }

  // RATE LIMITING METHODS (Step 3)

  /**
   * Increment counter cho rate limiting
   * @returns số lần request hiện tại
   */
  async incrementRateLimit(key: string, windowSeconds: number = REDIS_TTL.RATE_LIMIT_WINDOW): Promise<number> {
    const fullKey = `${REDIS_KEY_PREFIX.RATE_LIMIT}${key}`
    const current = await this.redis.incr(fullKey)
    
    // Set TTL nếu là lần đầu tiên
    if (current === 1) {
      await this.redis.expire(fullKey, windowSeconds)
    }
    
    return current
  }

  async getRateLimitCount(key: string): Promise<number> {
    const fullKey = `${REDIS_KEY_PREFIX.RATE_LIMIT}${key}`
    const count = await this.redis.get(fullKey)
    return count ? parseInt(count, 10) : 0
  }
}