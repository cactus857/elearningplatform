import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

// Controllers
import { AiCourseGeneratorController } from './ai-course-generator.controller'

// Services
import { AiCourseGeneratorService } from './ai-course-generator.service'
import { YouTubeService } from '../integrations/youtube.service'
import { GuruLabService } from '../integrations/gurulab.service'

// Workflow
import { CourseGeneratorWorkflow } from '../workflows/course-generator.workflow'

// Nodes
import { CoursePlannerNode } from '../nodes/course/course-planner.node'
import { ChapterGeneratorNode } from '../nodes/course/chapter-generator.node'
import { ThumbnailGeneratorNode } from '../nodes/course/thumbnail-generator.node'

import { VideoFetcherNode } from '../nodes/course/video-fetcher.node'

import { AiCourseGeneratorRepository } from './ai-course-generator.repository'

@Module({
  imports: [
    HttpModule, // For GuruLab API calls
  ],
  controllers: [AiCourseGeneratorController],
  providers: [
    // Main service
    AiCourseGeneratorService,

    // Repository
    AiCourseGeneratorRepository,
    // Workflow
    CourseGeneratorWorkflow,

    // Nodes
    CoursePlannerNode,
    ChapterGeneratorNode,
    ThumbnailGeneratorNode,
    VideoFetcherNode,

    // Integration services
    YouTubeService,
    GuruLabService,
  ],
  exports: [AiCourseGeneratorService],
})
export class AiCourseGeneratorModule {}
