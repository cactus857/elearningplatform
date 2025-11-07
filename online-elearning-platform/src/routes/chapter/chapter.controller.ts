import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ChapterService } from './chapter.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateChapterBodyDTO,
  CreateChapterResDTO,
  GetChapterDetailResDTO,
  GetChapterParamsDTO,
  GetChaptersQueryDTO,
  GetChaptersResDTO,
  ReorderChaptersBodyDTO,
  UpdateChapterBodyDTO,
  UpdateChapterResDTO,
} from './chapter.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetChaptersResDTO)
  list(@Query() query: GetChaptersQueryDTO) {
    return this.chapterService.list(query.courseId)
  }

  @Get(':chapterId')
  @IsPublic()
  @ZodSerializerDto(GetChapterDetailResDTO)
  findById(@Param() params: GetChapterParamsDTO) {
    return this.chapterService.findById(params.chapterId)
  }

  @Post()
  @ZodSerializerDto(CreateChapterResDTO)
  create(
    @Body() body: CreateChapterBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.chapterService.create({
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Put('reorder')
  @ZodSerializerDto(MessageResDTO)
  reorder(
    @Body() body: ReorderChaptersBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.chapterService.reorder({
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Put(':chapterId')
  @ZodSerializerDto(UpdateChapterResDTO)
  update(
    @Param() params: GetChapterParamsDTO,
    @Body() body: UpdateChapterBodyDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.chapterService.update({
      id: params.chapterId,
      data: body,
      userId,
      userRoleName: roleName,
    })
  }

  @Delete(':chapterId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetChapterParamsDTO,
    @ActiveUser('userId') userId: string,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.chapterService.delete({
      id: params.chapterId,
      userId,
      userRoleName: roleName,
    })
  }
}
