import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '../surveys/survey.entity';
import { Question } from '../questions/question.entity';
import { Response } from '../responses/response.entity';
import { Answer } from '../responses/answer.entity';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async getResults(surveyId: string, orgId: string) {
    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId, organizationId: orgId },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const questions = await this.questionsRepository.find({
      where: { surveyId },
      order: { position: 'ASC' },
    });

    // KPIs
    const totalResponses = await this.responsesRepository.count({
      where: { surveyId },
    });
    const completeResponses = await this.responsesRepository.count({
      where: { surveyId, isComplete: true },
    });
    const completionRate = totalResponses > 0
      ? Math.round((completeResponses / totalResponses) * 100)
      : 0;

    // NPS score
    const npsQuestion = questions.find(q => q.type === 'nps');
    let npsScore: number | null = null;
    if (npsQuestion) {
      const npsAnswers = await this.answersRepository.find({
        where: { questionId: npsQuestion.id },
      });
      const total = npsAnswers.length;
      if (total > 0) {
        const promoters = npsAnswers.filter(a => a.value >= 9).length;
        const detractors = npsAnswers.filter(a => a.value <= 6).length;
        npsScore = Math.round(((promoters - detractors) / total) * 100);
      }
    }

    // Chart data per question
    const questionCharts = await Promise.all(
      questions.map(q => this.buildChartData(q)),
    );

    return {
      kpis: {
        totalResponses,
        completionRate,
        npsScore,
      },
      questions: questionCharts,
    };
  }

  private async buildChartData(question: Question) {
    const answers = await this.answersRepository.find({
      where: { questionId: question.id },
    });

    switch (question.type) {
      case 'text': {
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'text',
          responses: answers.map(a => ({
            responseId: a.responseId,
            text: a.value,
          })),
        };
      }

      case 'single_choice':
      case 'dropdown': {
        const counts: Record<string, number> = {};
        answers.forEach(a => {
          const key = String(a.value);
          counts[key] = (counts[key] || 0) + 1;
        });
        const total = answers.length || 1;
        const data = Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage: Math.round((count / total) * 100),
        }));
        data.sort((a, b) => b.count - a.count);
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'bar',
          data,
        };
      }

      case 'multiple_choice': {
        const counts: Record<string, number> = {};
        answers.forEach(a => {
          const values: string[] = Array.isArray(a.value) ? a.value : [a.value];
          values.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
          });
        });
        const total = answers.length || 1;
        const data = Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage: Math.round((count / total) * 100),
        }));
        data.sort((a, b) => b.count - a.count);
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'stacked_bar',
          data,
        };
      }

      case 'rating': {
        const maxRating = question.settings?.maxRating || 5;
        const distribution: Record<number, number> = {};
        let sum = 0;
        answers.forEach(a => {
          const rating = Number(a.value);
          distribution[rating] = (distribution[rating] || 0) + 1;
          sum += rating;
        });
        const average = answers.length > 0
          ? Math.round((sum / answers.length) * 10) / 10
          : 0;
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'rating',
          maxRating,
          distribution,
          average,
          total: answers.length,
        };
      }

      case 'yes_no': {
        const yes = answers.filter(a => a.value === true || a.value === 'true' || a.value === 'Sí').length;
        const no = answers.filter(a => a.value === false || a.value === 'false' || a.value === 'No').length;
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'donut',
          yes,
          no,
        };
      }

      case 'nps': {
        const promoters = answers.filter(a => Number(a.value) >= 9).length;
        const passives = answers.filter(a => Number(a.value) >= 7 && Number(a.value) <= 8).length;
        const detractors = answers.filter(a => Number(a.value) <= 6).length;
        const total = answers.length || 1;
        const score = Math.round(((promoters - detractors) / total) * 100);
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'nps',
          promoters,
          passives,
          detractors,
          score,
          distribution: answers.reduce((acc: any, a) => {
            const v = Number(a.value);
            acc[v] = (acc[v] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
        };
      }

      default:
        return {
          questionId: question.id,
          type: question.type,
          label: question.label,
          chartType: 'unknown',
          responseCount: answers.length,
        };
    }
  }
}
