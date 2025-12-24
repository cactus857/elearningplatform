import { Controller, Get, Post, Query } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { QUEUE_NAMES, JOB_NAMES } from 'src/shared/constants/queue.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { ElasticsearchService } from 'src/shared/services/elasticsearch.service'

@Controller('search')
export class SearchController {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @InjectQueue(QUEUE_NAMES.ELASTICSEARCH) private esQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  @Post('sync-all')
  async syncAllCourses() {
    const courses = await this.prismaService.course.findMany({
      where: { deletedAt: null },
      include: {
        instructor: {
          select: { id: true, fullName: true, email: true, avatar: true }
        },
        _count: { select: { enrollments: true } }
      }
    })

    // Add bulk job
    await this.esQueue.add(
      JOB_NAMES.BULK_INDEX_COURSES,
      { courses },
      { priority: 2 }
    )

    return {
      message: 'Sync job added to queue',
      count: courses.length,
    }
  }

  @Get('courses')
  @IsPublic()
  async searchCourses(
    @Query('keyword') keyword?: string,
    @Query('level') level?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.elasticsearchService.searchCourses({
      keyword,
      level,
      category,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    })

    return {
      data: result.data,
      totalItems: result.total,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    }
  }

  @Get('courses/suggest')
  @IsPublic()
  async suggestCourses(@Query('keyword') keyword: string) {
    const suggestions = await this.elasticsearchService.suggestCourses(keyword)
    return { suggestions }
  }
}