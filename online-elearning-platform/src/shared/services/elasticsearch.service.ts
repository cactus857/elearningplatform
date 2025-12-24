import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { ES_INDEX, ES_MAPPINGS } from '../constants/elasticsearch.constant'
import { transformCourseToDocument } from '../helper'

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name)

  constructor(private readonly esService: NestElasticsearchService) {}

  async onModuleInit() {
    await this.createCoursesIndex()
  }
  // INDEX MANAGEMENT - FIX
  async createCoursesIndex(): Promise<void> {
    const index = ES_INDEX.COURSES

    try {
      const indexExists = await this.esService.indices.exists({ index })

      if (!indexExists) {
        await this.esService.indices.create({
          index,
          mappings: ES_MAPPINGS.COURSES, 
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
        })
        this.logger.log(`Created index: ${index}`)
      } else {
        this.logger.log(`Index ${index} already exists`)
      }
    } catch (error) {
      this.logger.error(`Failed to create index ${index}:`, error)
    }
  }

  async deleteIndex(index: string): Promise<void> {
    try {
      await this.esService.indices.delete({ index })
      this.logger.log(`Deleted index: ${index}`)
    } catch (error) {
      this.logger.error(`Failed to delete index ${index}:`, error)
    }
  }

  // COURSE INDEXING
  async indexCourse(course: any): Promise<void> {
    try {
      const document = transformCourseToDocument(course)

      await this.esService.index({
        index: ES_INDEX.COURSES,
        id: course.id,
        document,
      })

      this.logger.log(`[ES] Indexed course: ${course.id}`)
    } catch (error) {
      this.logger.error(`[ES] Failed to index course ${course.id}:`, error)
    }
  }

  async updateCourse(courseId: string, course: any): Promise<void> {
    try {
      const document = transformCourseToDocument(course)

      await this.esService.update({
        index: ES_INDEX.COURSES,
        id: courseId,
        doc: document,
      })

      this.logger.log(`[ES] Updated course: ${courseId}`)
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        await this.indexCourse({ ...course, id: courseId })
      } else {
        this.logger.error(`[ES] Failed to update course ${courseId}:`, error)
      }
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await this.esService.delete({
        index: ES_INDEX.COURSES,
        id: courseId,
      })

      this.logger.log(`[ES] Deleted course: ${courseId}`)
    } catch (error: any) {
      if (error.meta?.statusCode !== 404) {
        this.logger.error(`[ES] Failed to delete course ${courseId}:`, error)
      }
    }
  }

  async bulkIndexCourses(courses: any[]): Promise<void> {
    if (!courses.length) {
      this.logger.log('[ES] No courses to index')
      return
    }

    try {
      const operations = courses.flatMap((course) => [
        { index: { _index: ES_INDEX.COURSES, _id: course.id } },
        transformCourseToDocument(course),
      ])

      const result = await this.esService.bulk({
        refresh: true,
        operations,
      })

      if (result.errors) {
        const erroredItems = result.items.filter((item) => item.index?.error)
        this.logger.error('[ES] Bulk indexing errors:', erroredItems)
      } else {
        this.logger.log(`[ES] Successfully indexed ${courses.length} courses`)
      }
    } catch (error) {
      this.logger.error('[ES] Bulk indexing failed:', error)
    }
  }

  // SEARCH - FIX
  async searchCourses(query: {
    keyword?: string
    level?: string
    category?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: any[]; total: number }> {
    const { keyword, level, category, status, page = 1, limit = 10 } = query

    const must: any[] = []
    const filter: any[] = []

    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ['title^3', 'description', 'smallDescription', 'instructor.fullName'],
          fuzziness: 'AUTO',
        },
      })
    }

    if (level) {
      filter.push({ term: { level } })
    }

    if (category) {
      filter.push({ term: { category } })
    }

    if (status) {
      filter.push({ term: { status } })
    } else {
      filter.push({ term: { status: 'PUBLISHED' } })
    }

    try {
      const result = await this.esService.search({
        index: ES_INDEX.COURSES,
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: {
            must: must.length ? must : [{ match_all: {} }],
            filter,
          },
        },
        highlight: {
          fields: {
            title: {},
            description: {},
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
        sort: [
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } },
        ],
      })

      const hits = result.hits.hits
      const total =
        typeof result.hits.total === 'number'
          ? result.hits.total
          : result.hits.total?.value || 0

      const data = hits.map((hit) => ({
        ...(hit._source as object),
        id: hit._id,
        _score: hit._score,
        highlight: hit.highlight,
      }))

      return { data, total }
    } catch (error) {
      this.logger.error('[ES] Search failed:', error)
      return { data: [], total: 0 }
    }
  }

  async suggestCourses(keyword: string, limit: number = 5): Promise<string[]> {
    try {
      const result = await this.esService.search({
        index: ES_INDEX.COURSES,
        size: limit,
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: {
                  title: {
                    query: keyword,
                    max_expansions: 10,
                  },
                },
              },
            ],
            filter: [{ term: { status: 'PUBLISHED' } }],
          },
        },
        _source: ['title'],
      })

      return result.hits.hits
        .map((hit) => (hit._source as { title?: string })?.title)
        .filter((title): title is string => !!title)
    } catch (error) {
      this.logger.error('[ES] Suggest failed:', error)
      return []
    }
  }
  
  
}