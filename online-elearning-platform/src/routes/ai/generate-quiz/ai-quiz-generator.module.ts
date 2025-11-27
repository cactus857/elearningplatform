import { Module } from '@nestjs/common'

// Controller
import { AiQuizGeneratorController } from './ai-quiz-generator.controller'

// Service & Repository
import { AiQuizGeneratorService } from './ai-quiz-generator.service'
import { AiQuizGeneratorRepository } from './ai-quiz-generator.repository'

// Workflow
import { QuizGeneratorWorkflow } from '../workflows/quiz-generator.workflow'

// Nodes
import { QuizPlannerNode } from '../nodes/quiz/quiz-planner.node'
import { QuestionGeneratorNode } from '../nodes/quiz/question-generator.node'
import { AnswerValidatorNode } from '../nodes/quiz/answer-validator.node'

@Module({
  controllers: [AiQuizGeneratorController],
  providers: [
    // Main service
    AiQuizGeneratorService,

    // Repository
    AiQuizGeneratorRepository,

    // Workflow
    QuizGeneratorWorkflow,

    // Nodes
    QuizPlannerNode,
    QuestionGeneratorNode,
    AnswerValidatorNode,
  ],
  exports: [AiQuizGeneratorService],
})
export class AiQuizGeneratorModule {}
