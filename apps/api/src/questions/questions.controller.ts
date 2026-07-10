import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class ReorderQuestionsDto {
  @IsArray()
  questionIds: string[];
}

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('surveys/:id/questions')
  @ApiOperation({ summary: 'Get questions for a survey (ordered by position)' })
  async findBySurvey(@CurrentUser() user: any, @Param('id') surveyId: string) {
    return this.questionsService.findBySurvey(surveyId, user.organizationId);
  }

  @Post('surveys/:id/questions')
  @ApiOperation({ summary: 'Add a question to a survey' })
  async create(
    @CurrentUser() user: any,
    @Param('id') surveyId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.create(surveyId, dto, user.organizationId);
  }

  @Patch('questions/:qid')
  @ApiOperation({ summary: 'Update a question' })
  async update(
    @CurrentUser() user: any,
    @Param('qid') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(questionId, dto, user.organizationId);
  }

  @Delete('questions/:qid')
  @ApiOperation({ summary: 'Delete a question' })
  async delete(@CurrentUser() user: any, @Param('qid') questionId: string) {
    return this.questionsService.delete(questionId, user.organizationId);
  }

  @Patch('surveys/:id/questions/reorder')
  @ApiOperation({ summary: 'Reorder questions' })
  async reorder(
    @CurrentUser() user: any,
    @Param('id') surveyId: string,
    @Body() dto: ReorderQuestionsDto,
  ) {
    return this.questionsService.reorder(surveyId, dto.questionIds, user.organizationId);
  }
}
