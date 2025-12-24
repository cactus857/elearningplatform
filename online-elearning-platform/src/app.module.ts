import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/share.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { PermissionModule } from './routes/permission/permission.module'
import { RoleModule } from './routes/role/role.module'
import { ProfileModule } from './routes/profile/profile.module'
import { UserModule } from './routes/user/user.module'
import { MediaModule } from './routes/media/media.module'
import { CourseModule } from './routes/course/course.module'
import { ChapterModule } from './routes/chapter/chapter.module'
import { LessonModule } from './routes/lesson/lesson.module'
import { EnrollmentModule } from './routes/enrollment/enrollment.module'
import { QuizzModule } from './routes/quizz/quizz.module'
import { AiQuizGeneratorModule } from './routes/ai/generate-quiz/ai-quiz-generator.module'
import { AiCourseGeneratorModule } from './routes/ai/generate-course/ai-course-generator.module'
import { DashboardModule } from './routes/dashboard/dashboard.module'
import { ProgressModule } from './routes/progress/progress.module'
import { RedisModule } from '@nestjs-modules/ioredis';
import envConfig from './shared/config'
import { ElasticsearchModule } from '@nestjs/elasticsearch'
import { BullModule } from '@nestjs/bullmq'
import { QUEUE_NAMES } from './shared/constants/queue.constant'
import { ElasticsearchProcessor } from './shared/processors/elasticsearch.processor'
import { SearchModule } from './routes/elasticsearch/search.module'

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: envConfig.REDIS_HOST,
        port: parseInt(envConfig.REDIS_PORT),
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
      },
    }),
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        cloud:{id: envConfig.ELASTICSEARCH_CLOUD_ID},
        auth: {
          username: envConfig.ELASTICSEARCH_USERNAME,
          password: envConfig.ELASTICSEARCH_PASSWORD,
        },
      })
    }),
    BullModule.forRoot({
      connection: {
        host: envConfig.REDIS_HOST,
        port: parseInt(envConfig.REDIS_PORT),
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1s 
        },
        removeOnComplete: 100,
        removeOnFail: 50 
      }
    }),

    // Register Queue
    BullModule.registerQueue({
      name: QUEUE_NAMES.ELASTICSEARCH,
    }),
    SharedModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    CourseModule,
    ChapterModule,
    LessonModule,
    EnrollmentModule,
    QuizzModule,
    AiCourseGeneratorModule,
    AiQuizGeneratorModule,
    DashboardModule,
    ProgressModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ElasticsearchProcessor,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
