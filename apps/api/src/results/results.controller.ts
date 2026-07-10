import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys/:id/results')
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  @Get()
  @ApiOperation({ summary: 'Get survey results with KPIs and chart data' })
  async getResults(@CurrentUser() user: any, @Param('id') id: string) {
    return this.resultsService.getResults(id, user.organizationId);
  }
}
