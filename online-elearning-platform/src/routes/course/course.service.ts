import { ForbiddenException, Injectable } from '@nestjs/common'
import { CourseRepository } from './course.repository'
import { CreateCourseBodyType, GetCoursesQueryType, UpdateCourseBodyType } from './course.model'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constants'
import { CourseSlugExistsException } from './course.error'
import { isNotFoundPrismaError } from 'src/shared/helper'
import slugify from 'slugify'
import { RedisService } from 'src/shared/services/redis.service'
import * as crypto from 'crypto'

@Injectable()
export class CourseService {
  constructor(private courseRepository: CourseRepository, private redisService: RedisService) {}

  private generateSlug(title: string): string {
    const slug = slugify(title, { lower: true, strict: true })
    return slug
  }

  private generateQueryHash(query: GetCoursesQueryType, prefix: string = ''): string {
    const queryString = JSON.stringify({ ...query, prefix })
    return crypto.createHash('md5').update(queryString).digest('hex')
  }
  
  async list(query: GetCoursesQueryType) {
    // 1. Check cache
    const queryHash = this.generateQueryHash(query, 'public')
    const cached = await this.redisService.getCourseList(queryHash)
    
    if (cached) {
      return cached
    }

    // 2. Query DB
    const data = await this.courseRepository.list(query)

    // 3. Save to cache
    await this.redisService.setCourseList(queryHash, data)

    return data
  }

  async listByRole(query: GetCoursesQueryType, userId: string, roleName: string) {
    if (roleName === RoleName.Instructor) {
      // 1. Check cache
      const queryHash = this.generateQueryHash(query, `instructor:${userId}`)
      const cached = await this.redisService.getCourseList(queryHash)
      
      if (cached) {
        return cached
      }

      // 2. Query DB
      const data = await this.courseRepository.listByInstructor(query, userId)

      // 3. Save to cache
      await this.redisService.setCourseList(queryHash, data)

      return data
    } else if (roleName === RoleName.Admin) {
      // Admin dùng list() có cache
      return await this.list(query)
    } else {
      throw new ForbiddenException('You do not have permission to view this resource')
    }
  }

  async findById(id: string) {
    // 1. Check cache
    const cached = await this.redisService.getCourseDetail(id)
    
    if (cached) {
      return cached
    }

    // 2. Query DB
    const course = await this.courseRepository.findById(id)
    if (!course) throw NotFoundRecordException

    // 3. Save to cache
    await this.redisService.setCourseDetail(id, course)

    return course
  }

  async findBySlug(slug: string) {
    // 1. Check cache
    const cached = await this.redisService.getCourseBySlug(slug)
    
    if (cached) {
      return cached
    }

    // 2. Query DB
    const course = await this.courseRepository.findBySlug(slug)
    if (!course) throw NotFoundRecordException

    // 3. Save to cache (cả slug và id)
    await Promise.all([
      this.redisService.setCourseBySlug(slug, course),
      this.redisService.setCourseDetail(course.id, course),
    ])

    return course
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateCourseBodyType
    createdById: string
    createdByRoleName: string
  }) {
    try {
      let instructorId: string

      if (createdByRoleName === RoleName.Admin) {
        instructorId = data.instructorId || createdById
      } else if (createdByRoleName === RoleName.Instructor) {
        instructorId = createdById
      } else {
        throw new ForbiddenException('Only instructors and admins can create courses')
      }

      const slug = data.slug ? data.slug : this.generateSlug(data.title)

      const slugExists = await this.courseRepository.checkSlugExists(slug)
      if (slugExists) throw CourseSlugExistsException

      const course = await this.courseRepository.create({
        data: {
          ...data,
          instructorId,
          slug,
        },
        createdById,
      })

      // Save to cache
      await this.redisService.invalidateCourseList()

      return course
    } catch (error) {
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    id: string
    data: UpdateCourseBodyType
    updatedById: string
    updatedByRoleName: string
  }) {
    try {
      // Kiểm tra course có tồn tại không
      const course = await this.courseRepository.findById(id)
      if (!course) throw NotFoundRecordException

      // Kiểm tra quyền: Admin được update tất cả, Instructor chỉ được update course của mình
      if (updatedByRoleName === RoleName.Instructor && course.instructorId !== updatedById) {
        throw new ForbiddenException('You can only update your own courses')
      }

      // Nếu update title, cần tạo slug mới
      let updateData = { ...data }
      let newSlug: string | null = null
      if (data.title) {
        newSlug = this.generateSlug(data.title)
        const slugExists = await this.courseRepository.checkSlugExists(newSlug, id)
        if (slugExists) throw CourseSlugExistsException
        updateData = { ...updateData, slug: newSlug } as any
      }

      // Admin có thể thay đổi instructorId
      if (data.instructorId && updatedByRoleName !== RoleName.Admin) {
        throw new ForbiddenException('Only admins can change course instructor')
      }

      const updatedCourse = await this.courseRepository.update({
        id,
        data: updateData,
        updatedById,
      })

      await this.redisService.invalidateCourseAll(id, course.slug)
      
      // Nếu slug thay đổi, invalidate slug mới luôn
      if (newSlug && newSlug !== course.slug) {
        await this.redisService.invalidateCourse(id, newSlug)
      }

      return updatedCourse
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }

  async delete({ id, deletedById, deletedByRoleName }: { id: string; deletedById: string; deletedByRoleName: string }) {
    try {
      const course = await this.courseRepository.findById(id)
      if (!course) throw NotFoundRecordException

      // Kiểm tra quyền: Admin được xóa tất cả, Instructor chỉ được xóa course của mình
      if (deletedByRoleName === RoleName.Instructor && course.instructorId !== deletedById) {
        throw new ForbiddenException('You can only delete your own courses')
      }

      await this.courseRepository.delete({ id, deletedById })

      await this.redisService.invalidateCourseAll(id, course.slug)

      return { message: 'Course deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) throw NotFoundRecordException
      throw error
    }
  }
}
