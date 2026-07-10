import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { Survey } from './survey.entity';
import { Question } from '../questions/question.entity';
import { SurveyTemplate } from '../templates/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, SurveyTemplate])],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
