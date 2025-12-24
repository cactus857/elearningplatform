import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomInt } from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

uuidv4()

export function isUniqueConstraintPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export function isForeignKeyConstraintPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateOTP = () => {
  return String(randomInt(100000, 1000000))
}

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename)
  return `${uuidv4()}${ext}`
}

export const parseWithDates = (json: string): any => {
    return JSON.parse(json, (key, value) => {
      // Check nếu value là ISO date string
      if (typeof value === 'string') {
        // ISO 8601 format: 2024-12-23T10:00:00.000Z
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
        if (isoDateRegex.test(value)) {
          return new Date(value)
        }
      }
      return value
    })
  }

  // HELPER
  export const transformCourseToDocument = (course: any): any => {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      smallDescription: course.smallDescription,
      slug: course.slug,
      category: course.category,
      level: course.level,
      status: course.status,
      thumbnail: course.thumbnail,
      duration: course.duration,
      instructor: course.instructor
        ? {
            id: course.instructor.id,
            fullName: course.instructor.fullName,
            email: course.instructor.email,
            avatar: course.instructor.avatar,
          }
        : null,
      enrollmentCount: course._count?.enrollments || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }
  }