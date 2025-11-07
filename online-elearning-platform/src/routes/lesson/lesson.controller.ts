import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { LessonService } from './lesson.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateLessonBodyDTO,
  CreateLessonResDTO,
  GetLessonDetailResDTO,
  GetLessonParamsDTO,
  GetLessonsQueryDTO,
  GetLessonsResDTO,
  ReorderLessonsBodyDTO,
  UpdateLessonBodyDTO,
  UpdateLessonResDTO,
} from './lesson.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetLessonsResDTO)
  list(@Query() query: GetLessonsQueryDTO) {
    return this.lessonService.list(query.chapterId)
  }

  @Get(':lessonId')
  @IsPublic()
  @ZodSerializerDto(GetLessonDetailResDTO)
  findById(@Param() params: GetLessonParamsDTO) {
    return this.lessonService.findById(params.lessonId)
  }

  @Post()
  @ZodSerializerDto(CreateLessonResDTO)
  create(
    @Body() body: CreateLessonBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.lessonService.create({
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Put('reorder')
  @ZodSerializerDto(MessageResDTO)
  reorder(
    @Body() body: ReorderLessonsBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.lessonService.reorder({
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Put(':lessonId')
  @ZodSerializerDto(UpdateLessonResDTO)
  update(
    @Param() params: GetLessonParamsDTO,
    @Body() body: UpdateLessonBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.lessonService.update({
      id: params.lessonId,
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Delete(':lessonId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetLessonParamsDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.lessonService.delete({
      id: params.lessonId,
      userId,
      userRoleName: roleName,
    })
  }
}
