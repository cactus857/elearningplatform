import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_KEY_PREFIX, REDIS_TTL } from '../constants/redis.constant'
import * as crypto from 'crypto'
import { parseWithDates } from '../helper'

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

  // RATE LIMITING METHODS

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

  async getTTL(key: string): Promise<number> {
    const fullKey = key.startsWith(REDIS_KEY_PREFIX.RATE_LIMIT) ? key : `${REDIS_KEY_PREFIX.RATE_LIMIT}${key}`
    return this.redis.ttl(fullKey)
  }

  // COURSE CACHING METHODS
  
/**
 * Lưu course detail vào cache
 */
async setCourseDetail(courseId: string, data: any): Promise<void> {
  const key = `${REDIS_KEY_PREFIX.COURSE_DETAIL}${courseId}`
  await this.redis.setex(key, REDIS_TTL.COURSE_DETAIL, JSON.stringify(data))
}

/**
 * Lấy course detail từ cache
 */
async getCourseDetail(courseId: string): Promise<any | null> {
  const key = `${REDIS_KEY_PREFIX.COURSE_DETAIL}${courseId}`
  const data = await this.redis.get(key)
  return data ? parseWithDates(data) : null
}

/**
 * Lưu course by slug vào cache
 */
async setCourseBySlug(slug: string, data: any): Promise<void> {
  const key = `${REDIS_KEY_PREFIX.COURSE_SLUG}${slug}`
  await this.redis.setex(key, REDIS_TTL.COURSE_DETAIL, JSON.stringify(data))
}

/**
 * Lấy course by slug từ cache
 */
async getCourseBySlug(slug: string): Promise<any | null> {
  const key = `${REDIS_KEY_PREFIX.COURSE_SLUG}${slug}`
  const data = await this.redis.get(key)
  return data ? parseWithDates(data) : null
}

/**
 * Lưu course list vào cache
 * Key format: courses:list:{queryHash}
 */
async setCourseList(queryHash: string, data: any): Promise<void> {
  const key = `${REDIS_KEY_PREFIX.COURSE_LIST}${queryHash}`
  await this.redis.setex(key, REDIS_TTL.COURSE_LIST, JSON.stringify(data))
}

/**
 * Lấy course list từ cache
 */
async getCourseList(queryHash: string): Promise<any | null> {
  const key = `${REDIS_KEY_PREFIX.COURSE_LIST}${queryHash}`
  const data = await this.redis.get(key)
  return data ? parseWithDates(data) : null
}

/**
 * Invalidate cache của 1 course (detail + slug)
 */
async invalidateCourse(courseId: string, slug?: string): Promise<void> {
  const keys = [`${REDIS_KEY_PREFIX.COURSE_DETAIL}${courseId}`]
  
  if (slug) {
    keys.push(`${REDIS_KEY_PREFIX.COURSE_SLUG}${slug}`)
  }
  
  await this.redis.del(...keys)
}

/**
 * Invalidate tất cả course list cache
 */
async invalidateCourseList(): Promise<void> {
  const pattern = `${REDIS_KEY_PREFIX.COURSE_LIST}*`
  const keys = await this.redis.keys(pattern)
  
  if (keys.length > 0) {
    await this.redis.del(...keys)
  }
}

/**
 * Invalidate course + all list 
 */
async invalidateCourseAll(courseId: string, slug?: string): Promise<void> {
  await Promise.all([
    this.invalidateCourse(courseId, slug),
    this.invalidateCourseList(),
  ])
}
}