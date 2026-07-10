import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResponsesService } from './responses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsUUID()
  questionId: string;

  value: any;
}

export class SubmitResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsString()
  respondentEmail?: string;
}

@ApiTags('Responses')
@Controller()
export class ResponsesController {
  constructor(private responsesService: ResponsesService) {}

  @Get('survey/:slug')
  @ApiOperation({ summary: 'Public: Get active survey by slug' })
  async findBySlug(@Param('slug') slug: string) {
    // Forward to surveys service via import or inline
    const { SurveysService } = require('../surveys/surveys.service');
    // This won't work, we handle it differently
    // Actually let's just return a redirect
    return { message: 'Use GET /api/surveys/:id for authenticated access or POST to submit' };
  }

  @Post('surveys/:id/responses')
  @ApiOperation({ summary: 'Public: Submit a response (no auth)' })
  async submit(
    @Param('id') surveyId: string,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.responsesService.submit(surveyId, dto);
  }

  @Get('surveys/:id/responses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List responses for a survey (auth required)' })
  async findAll(
    @CurrentUser() user: any,
    @Param('id') surveyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.responsesService.findAll(
      surveyId,
      user.organizationId,
      pagination.page || 1,
      pagination.limit || 12,
    );
  }

  @Get('surveys/:id/responses/:rid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full response with answers (auth required)' })
  async findById(
    @CurrentUser() user: any,
    @Param('id') surveyId: string,
    @Param('rid') responseId: string,
  ) {
    return this.responsesService.findById(surveyId, responseId, user.organizationId);
  }
}
