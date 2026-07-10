import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Survey } from './survey.entity';
import { Question } from '../questions/question.entity';
import { SurveyTemplate } from '../templates/template.entity';
import * as slugifyLib from 'slugify';
import { randomBytes } from 'crypto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(SurveyTemplate)
    private templatesRepository: Repository<SurveyTemplate>,
  ) {}

  async findAll(
    orgId: string,
    options: { status?: string; search?: string; page: number; limit: number },
  ) {
    const { status, search, page, limit } = options;
    const where: any = { organizationId: orgId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [data, total] = await this.surveysRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { questions: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, orgId: string) {
    const survey = await this.surveysRepository.findOne({
      where: { id, organizationId: orgId },
      relations: { questions: true },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    return survey;
  }

  async create(data: { title: string; description?: string; templateId?: string }, orgId: string) {
    const slug = this.generateSlug(data.title);

    let questions: any[] = [];

    if (data.templateId) {
      const template = await this.templatesRepository.findOne({
        where: { id: data.templateId },
      });
      if (template) {
        questions = template.questions.map((q: any, idx: number) => ({
          ...q,
          position: idx + 1,
        }));
      }
    }

    const survey = this.surveysRepository.create({
      title: data.title,
      description: data.description || undefined,
      slug,
      organizationId: orgId,
    });

    const savedSurvey = await this.surveysRepository.save(survey) as Survey;

    if (questions.length > 0) {
      const questionEntities = questions.map((q) =>
        this.questionsRepository.create({
          surveyId: savedSurvey.id,
          type: q.type,
          label: q.label,
          description: q.description || null,
          options: q.options || null,
          required: q.required || false,
          position: q.position,
          settings: q.settings || {},
        }),
      );
      await this.questionsRepository.save(questionEntities);
    }

    return this.findById(savedSurvey.id, orgId);
  }

  async update(id: string, data: { title?: string; description?: string }, orgId: string) {
    const survey = await this.findById(id, orgId);
    if (data.title) survey.title = data.title;
    if (data.description !== undefined) survey.description = data.description;
    return this.surveysRepository.save(survey);
  }

  async delete(id: string, orgId: string) {
    const survey = await this.findById(id, orgId);
    if (survey.status === 'active') {
      throw new BadRequestException('Cannot delete an active survey');
    }
    await this.surveysRepository.remove(survey);
    return { deleted: true };
  }

  async publish(id: string, orgId: string) {
    const survey = await this.findById(id, orgId);
    if (survey.status === 'active') {
      throw new BadRequestException('Survey is already active');
    }
    survey.status = 'active';
    survey.publishedAt = new Date();
    return this.surveysRepository.save(survey);
  }

  async close(id: string, orgId: string) {
    const survey = await this.findById(id, orgId);
    if (survey.status === 'closed') {
      throw new BadRequestException('Survey is already closed');
    }
    survey.status = 'closed';
    survey.closedAt = new Date();
    return this.surveysRepository.save(survey);
  }

  async reopen(id: string, orgId: string) {
    const survey = await this.findById(id, orgId);
    if (survey.status !== 'closed') {
      throw new BadRequestException('Survey is not closed');
    }
    survey.status = 'active';
    survey.closedAt = null as any;
    return this.surveysRepository.save(survey);
  }

  async findBySlug(slug: string) {
    const survey = await this.surveysRepository.findOne({
      where: { slug, status: 'active' },
      relations: { questions: true },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found or not active');
    }
    return survey;
  }

  private generateSlug(title: string): string {
    const base = slugifyLib.default(title, { lower: true, strict: true });
    const suffix = randomBytes(2).toString('hex');
    return `${base}-${suffix}`;
  }
}
