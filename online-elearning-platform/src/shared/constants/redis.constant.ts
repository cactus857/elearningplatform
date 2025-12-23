export const REDIS_KEY_PREFIX = {
  TOKEN_BLACKLIST: 'blacklist:token:',
  RATE_LIMIT: 'ratelimit:',
  OTP: 'otp:',
} as const

export const REDIS_TTL = {
  ACCESS_TOKEN: 60 * 60, // 1h
  RATE_LIMIT_WINDOW: 60, // 1mins
  OTP: 5 * 60, // 5mins
} as const