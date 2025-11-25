import { Injectable, Logger } from '@nestjs/common'
import { AIChapterType } from './types/schema.types'
import { CoursePlannerNode } from '../nodes/course-planner.node'
import { VideoFetcherNode } from '../nodes/video-fetcher.node'
import { ThumbnailGeneratorNode } from '../nodes/thumbnail-generator.node'
import { ChapterGeneratorNode } from '../nodes/chapter-generator.node'
import { entrypoint } from '@langchain/langgraph'

export interface GeneratedCourse {
  title: string
  description: string
  thumbnail: string
  duration: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  status: 'ARCHIVED' | 'DRAFT' | 'PUBLISHED'
  category: string
  smallDescription: string
  requirements: string[]
  whatYouWillLearn: string[]
  chapters: AIChapterType[]
}

@Injectable()
export class CourseGeneratorWorkflow {
  private readonly logger = new Logger(CourseGeneratorWorkflow.name)

  constructor(
    private coursePlannerNode: CoursePlannerNode,
    private chapterGeneratorNode: ChapterGeneratorNode,
    private thumbnailGeneratorNode: ThumbnailGeneratorNode,
    private videoFetcherNode: VideoFetcherNode,
  ) {}

  createWorkflow() {
    const planCourse = this.coursePlannerNode.createTask()
    const generateChapter = this.chapterGeneratorNode.createTask()
    const generateThumbnail = this.thumbnailGeneratorNode.createTask()
    const fetchVideo = this.videoFetcherNode.createTask()

    return entrypoint('courseGenerator', async (courseTopic: string): Promise<GeneratedCourse> => {
      this.logger.log(`🚀 Starting course generation for: ${courseTopic}`)

      // PHASE 1: Planning
      this.logger.log(`\n📋 PHASE 1: Course Planning`)
      const courseOutline = await planCourse(courseTopic)

      // PHASE 2: Parallel Generation
      this.logger.log(`\n🔄 PHASE 2: Parallel Generation (Chapters + Thumbnail)`)

      const [chapters, thumbnailUrl] = await Promise.all([
        // Generate all chapters in parallel
        Promise.all(courseOutline.chapters.map((chapterOutline) => generateChapter(chapterOutline))),
        // Generate thumbnail in parallel
        generateThumbnail(courseOutline.thumbnail),
      ])

      this.logger.log(`✅ Generated ${chapters.length} chapters`)
      this.logger.log(`✅ Thumbnail ready`)

      // PHASE 3: Fetch Videos for all lessons
      this.logger.log(`\n🎥 PHASE 3: Fetching Videos`)

      const chaptersWithVideos = await Promise.all(
        chapters.map(async (chapter) => {
          // Fetch videos for all lessons in parallel per chapter
          const lessonsWithVideos = await Promise.all(chapter.lessons.map((lesson) => fetchVideo(lesson)))

          return {
            ...chapter,
            lessons: lessonsWithVideos,
          }
        }),
      )

      const totalVideos = chaptersWithVideos.reduce(
        (sum, chapter) => sum + chapter.lessons.filter((l) => l.videoUrl).length,
        0,
      )
      this.logger.log(`✅ Fetched ${totalVideos} videos`)

      // PHASE 4: Final Assembly
      this.logger.log(`\n✨ PHASE 4: Course Assembly Complete`)

      const generatedCourse: GeneratedCourse = {
        title: courseOutline.title,
        description: courseOutline.description,
        thumbnail: thumbnailUrl,
        level: courseOutline.level,
        smallDescription: courseOutline.smallDescription,
        category: courseOutline.category,
        chapters: chaptersWithVideos,
        duration: courseOutline.duration,
        whatYouWillLearn: courseOutline.whatYouWillLearn,
        requirements: courseOutline.requirements,
        status: courseOutline.status,
      }

      this.logger.log(`\n🎉 Course generation completed!`)
      this.logger.log(`   Title: ${generatedCourse.title}`)
      this.logger.log(`   Chapters: ${generatedCourse.chapters.length}`)
      this.logger.log(`   Total Lessons: ${generatedCourse.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}`)

      return generatedCourse
    })
  }
}
