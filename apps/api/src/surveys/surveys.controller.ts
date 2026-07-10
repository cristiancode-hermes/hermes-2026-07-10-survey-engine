import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('Surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private surveysService: SurveysService) {}

  @Get()
  @ApiOperation({ summary: 'List surveys (paginated, filterable)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.surveysService.findAll(user.organizationId, {
      status,
      search,
      page: pagination.page || 1,
      limit: pagination.limit || 12,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new survey (optionally from template)' })
  async create(@CurrentUser() user: any, @Body() dto: CreateSurveyDto) {
    return this.surveysService.create(dto, user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey with questions' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.surveysService.findById(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update survey title/description' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateSurveyDto,
  ) {
    return this.surveysService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey (only if not active)' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.surveysService.delete(id, user.organizationId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish survey (set status to active)' })
  async publish(@CurrentUser() user: any, @Param('id') id: string) {
    return this.surveysService.publish(id, user.organizationId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close survey (set status to closed)' })
  async close(@CurrentUser() user: any, @Param('id') id: string) {
    return this.surveysService.close(id, user.organizationId);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen a closed survey' })
  async reopen(@CurrentUser() user: any, @Param('id') id: string) {
    return this.surveysService.reopen(id, user.organizationId);
  }
}
