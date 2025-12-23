export const REDIS_KEY_PREFIX = {
  TOKEN_BLACKLIST: 'blacklist:token:',
  RATE_LIMIT: 'ratelimit:',
  OTP: 'otp:',
  COURSE_DETAIL: 'course:',
  COURSE_SLUG: 'course:slug:',
  COURSE_LIST: 'courses:list:',
} as const

export const REDIS_TTL = {
  ACCESS_TOKEN: 60 * 60, // 1h
  RATE_LIMIT_WINDOW: 60, // 1mins
  OTP: 5 * 60, // 5mins
  COURSE_DETAIL: 5 * 60,   // 5mins
  COURSE_LIST: 2 * 60,  // 2mins
} as const