import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UPLOAD_DIR } from './shared/constants/other.constant'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // CORS configuration for production (Vercel) and development
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3300',
      'http://localhost:3300', // Local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })

  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // })
  await app.listen(process.env.PORT ?? 3000)
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`)
}
bootstrap()

