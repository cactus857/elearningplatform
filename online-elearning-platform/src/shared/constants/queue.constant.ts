export const QUEUE_NAMES = {
  ELASTICSEARCH: 'elasticsearch-sync',
} as const

export const JOB_NAMES = {
  // Course jobs
  INDEX_COURSE: 'index-course',
  UPDATE_COURSE: 'update-course',
  DELETE_COURSE: 'delete-course',
  BULK_INDEX_COURSES: 'bulk-index-courses',
} as const