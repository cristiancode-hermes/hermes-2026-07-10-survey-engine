import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './response.entity';
import { Answer } from './answer.entity';
import { Survey } from '../surveys/survey.entity';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
  ) {}

  async submit(
    surveyId: string,
    data: { answers: { questionId: string; value: any }[]; respondentEmail?: string },
  ) {
    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId, status: 'active' },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found or not active');
    }

    const response = this.responsesRepository.create({
      surveyId,
      respondentEmail: data.respondentEmail || undefined,
      startedAt: new Date(),
      submittedAt: new Date(),
    });
    const savedResponse = await this.responsesRepository.save(response) as unknown as Response;

    const answerEntities = data.answers.map((a) =>
      this.answersRepository.create({
        responseId: savedResponse.id,
        questionId: a.questionId,
        value: a.value,
      }),
    );
    await this.answersRepository.save(answerEntities);

    // Update response count and completion rate
    const totalResponses = await this.responsesRepository.count({
      where: { surveyId },
    });
    const completeResponses = await this.responsesRepository.count({
      where: { surveyId, isComplete: true },
    });
    await this.surveysRepository.update(surveyId, {
      responseCount: totalResponses,
      completionRate: totalResponses > 0 ? completeResponses / totalResponses : 0,
    });

    return { responseId: savedResponse.id };
  }

  async findAll(
    surveyId: string,
    orgId: string,
    page: number,
    limit: number,
  ) {
    await this.verifySurveyAccess(surveyId, orgId);

    const [data, total] = await this.responsesRepository.findAndCount({
      where: { surveyId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(surveyId: string, responseId: string, orgId: string) {
    await this.verifySurveyAccess(surveyId, orgId);

    const response = await this.responsesRepository.findOne({
      where: { id: responseId, surveyId },
      relations: { answers: true },
    });
    if (!response) {
      throw new NotFoundException('Response not found');
    }
    return response;
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
