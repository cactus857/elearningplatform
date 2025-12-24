import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue.constant'
import { ElasticsearchService } from '../services/elasticsearch.service'

@Processor(QUEUE_NAMES.ELASTICSEARCH)
export class ElasticsearchProcessor extends WorkerHost {
  private readonly logger = new Logger(ElasticsearchProcessor.name)

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)

    switch (job.name) {
      case JOB_NAMES.INDEX_COURSE:
        return this.handleIndexCourse(job.data)

      case JOB_NAMES.UPDATE_COURSE:
        return this.handleUpdateCourse(job.data)

      case JOB_NAMES.DELETE_COURSE:
        return this.handleDeleteCourse(job.data)

      case JOB_NAMES.BULK_INDEX_COURSES:
        return this.handleBulkIndexCourses(job.data)

      default:
        this.logger.warn(`Unknown job name: ${job.name}`)
    }
  }
  // JOB HANDLERS
  private async handleIndexCourse(data: { course: any }) {
    await this.elasticsearchService.indexCourse(data.course)
    return { success: true, courseId: data.course.id }
  }

  private async handleUpdateCourse(data: { courseId: string; course: any }) {
    await this.elasticsearchService.updateCourse(data.courseId, data.course)
    return { success: true, courseId: data.courseId }
  }

  private async handleDeleteCourse(data: { courseId: string }) {
    await this.elasticsearchService.deleteCourse(data.courseId)
    return { success: true, courseId: data.courseId }
  }

  private async handleBulkIndexCourses(data: { courses: any[] }) {
    await this.elasticsearchService.bulkIndexCourses(data.courses)
    return { success: true, count: data.courses.length }
  }
  // EVENT LISTENERS
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) completed`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`)
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) is now active`)
  }
}