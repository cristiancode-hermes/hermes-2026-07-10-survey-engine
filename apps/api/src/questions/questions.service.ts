import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { Survey } from '../surveys/survey.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
  ) {}

  async findBySurvey(surveyId: string, orgId: string) {
    await this.verifySurveyAccess(surveyId, orgId);
    return this.questionsRepository.find({
      where: { surveyId },
      order: { position: 'ASC' },
    });
  }

  async create(
    surveyId: string,
    data: {
      type: string;
      label: string;
      description?: string;
      options?: string[];
      required?: boolean;
      position?: number;
      settings?: Record<string, any>;
    },
    orgId: string,
  ) {
    await this.verifySurveyAccess(surveyId, orgId);

    let position = data.position;
    if (position === undefined || position === null) {
      const lastQuestion = await this.questionsRepository.findOne({
        where: { surveyId },
        order: { position: 'DESC' },
      });
      position = lastQuestion ? lastQuestion.position + 1 : 1;
    }

    const question = this.questionsRepository.create({
      surveyId,
      type: data.type,
      label: data.label,
      description: data.description || undefined,
      options: data.options || undefined,
      required: data.required || false,
      position,
      settings: data.settings || {},
    });

    return this.questionsRepository.save(question);
  }

  async update(
    questionId: string,
    data: {
      label?: string;
      description?: string;
      options?: string[];
      required?: boolean;
      settings?: Record<string, any>;
    },
    orgId: string,
  ) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: { survey: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (question.survey.organizationId !== orgId) {
      throw new NotFoundException('Question not found');
    }

    if (data.label !== undefined) question.label = data.label;
    if (data.description !== undefined) question.description = data.description;
    if (data.options !== undefined) question.options = data.options;
    if (data.required !== undefined) question.required = data.required;
    if (data.settings !== undefined) question.settings = data.settings;

    return this.questionsRepository.save(question);
  }

  async delete(questionId: string, orgId: string) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: { survey: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (question.survey.organizationId !== orgId) {
      throw new NotFoundException('Question not found');
    }
    await this.questionsRepository.remove(question);
    return { deleted: true };
  }

  async reorder(surveyId: string, questionIds: string[], orgId: string) {
    await this.verifySurveyAccess(surveyId, orgId);

    const questions = await this.questionsRepository.find({
      where: { surveyId },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    for (let i = 0; i < questionIds.length; i++) {
      const q = questionMap.get(questionIds[i]);
      if (q) {
        q.position = i + 1;
        await this.questionsRepository.save(q);
      }
    }

    return this.findBySurvey(surveyId, orgId);
  }

  private async verifySurveyAccess(surveyId: string, orgId: string) {
    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId, organizationId: orgId },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    return survey;
  }
}
