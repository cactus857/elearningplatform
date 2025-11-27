import { Injectable, Logger } from '@nestjs/common'
import { entrypoint } from '@langchain/langgraph'
import { QuizPlannerNode, CourseContentInput } from '../nodes/quiz/quiz-planner.node'
import { QuestionGeneratorNode, TopicWithContent } from '../nodes/quiz/question-generator.node'
import { AnswerValidatorNode } from '../nodes/quiz/answer-validator.node'
import { AICompleteQuizType } from './types/quiz-schema.types'

export interface GenerateQuizInput {
  courseTitle: string
  courseDescription: string
  chapters: Array<{
    title: string
    lessons: Array<{
      title: string
      content: string
    }>
  }>
  numberOfQuestions: number
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

@Injectable()
export class QuizGeneratorWorkflow {
  private readonly logger = new Logger(QuizGeneratorWorkflow.name)

  constructor(
    private quizPlannerNode: QuizPlannerNode,
    private questionGeneratorNode: QuestionGeneratorNode,
    private answerValidatorNode: AnswerValidatorNode,
  ) {}

  createWorkflow() {
    const planQuiz = this.quizPlannerNode.createTask()
    const generateQuestions = this.questionGeneratorNode.createTask()
    const validateAnswers = this.answerValidatorNode.createTask()

    return entrypoint('quizGenerator', async (input: GenerateQuizInput): Promise<AICompleteQuizType> => {
      this.logger.log(`🚀 Starting quiz generation for: ${input.courseTitle}`)

      // PHASE 1: Planning
      this.logger.log(`\n📋 PHASE 1: Quiz Planning`)
      const quizOutline = await planQuiz({
        courseTitle: input.courseTitle,
        courseDescription: input.courseDescription,
        chapters: input.chapters,
        numberOfQuestions: input.numberOfQuestions,
        difficulty: input.difficulty,
      } as CourseContentInput)

      // PHASE 2: Question Generation (Parallel)
      this.logger.log(`\n🔄 PHASE 2: Generating Questions`)

      const questionPromises = quizOutline.topics.map(async (topic) => {
        // Find relevant content for this topic
        const relatedContent = this.extractRelatedContent(input.chapters, topic.name)

        const topicInput: TopicWithContent = {
          topicName: topic.name,
          numberOfQuestions: topic.numberOfQuestions,
          keyPoints: topic.keyPoints,
          difficulty: input.difficulty,
          relatedContent,
        }

        return generateQuestions(topicInput)
      })

      const questionsByTopic = await Promise.all(questionPromises)
      const allQuestions = questionsByTopic.flat()

      this.logger.log(`✅ Generated ${allQuestions.length} questions total`)

      // PHASE 3: Validation
      this.logger.log(`\n🔍 PHASE 3: Validating Questions`)
      const validatedQuestions = await validateAnswers(allQuestions)

      this.logger.log(`✅ Validation complete: ${validatedQuestions.length} valid questions`)

      // PHASE 4: Final Assembly
      this.logger.log(`\n✨ PHASE 4: Quiz Assembly Complete`)

      const completeQuiz: AICompleteQuizType = {
        title: quizOutline.title,
        description: quizOutline.description,
        timeLimitMinutes: quizOutline.timeLimitMinutes,
        passingScore: quizOutline.passingScore,
        shuffleQuestions: quizOutline.shuffleQuestions,
        shuffleOptions: quizOutline.shuffleOptions,
        showCorrectAnswers: quizOutline.showCorrectAnswers,
        topics: quizOutline.topics,
        questions: validatedQuestions,
      }

      this.logger.log(`\n🎉 Quiz generation completed!`)
      this.logger.log(`   Title: ${completeQuiz.title}`)
      this.logger.log(`   Total Questions: ${completeQuiz.questions.length}`)
      this.logger.log(`   Topics Covered: ${completeQuiz.topics.length}`)

      return completeQuiz
    })
  }

  private extractRelatedContent(
    chapters: Array<{
      title: string
      lessons: Array<{ title: string; content: string }>
    }>,
    topicName: string,
  ): string {
    // Extract content from all lessons, prioritizing those matching the topic
    let content = ''

    for (const chapter of chapters) {
      for (const lesson of chapter.lessons) {
        // Check if lesson is related to topic (simple keyword matching)
        const isRelated =
          lesson.title.toLowerCase().includes(topicName.toLowerCase()) ||
          lesson.content.toLowerCase().includes(topicName.toLowerCase())

        if (isRelated) {
          content += `\n\n--- ${chapter.title} > ${lesson.title} ---\n${lesson.content.substring(0, 1000)}`
        }
      }
    }

    // If no specific match, include summary from all chapters
    if (!content) {
      content = chapters
        .map((ch) => {
          const lessonSummary = ch.lessons.map((l) => `${l.title}: ${l.content.substring(0, 300)}`).join('\n')
          return `Chapter: ${ch.title}\n${lessonSummary}`
        })
        .join('\n\n')
    }

    return content.substring(0, 3000) // Limit to avoid token limits
  }
}
