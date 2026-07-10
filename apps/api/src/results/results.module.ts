import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { Survey } from '../surveys/survey.entity';
import { Question } from '../questions/question.entity';
import { Response } from '../responses/response.entity';
import { Answer } from '../responses/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, Response, Answer])],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
