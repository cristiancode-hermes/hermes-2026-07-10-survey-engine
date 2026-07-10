import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Survey } from '../surveys/survey.entity';
import { Question } from '../questions/question.entity';
import { SurveyTemplate } from '../templates/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Survey, Question, SurveyTemplate])],
  providers: [SeedService],
})
export class SeedModule {}
