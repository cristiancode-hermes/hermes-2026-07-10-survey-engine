import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { Response } from './response.entity';
import { Answer } from './answer.entity';
import { Survey } from '../surveys/survey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Response, Answer, Survey])],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
