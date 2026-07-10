import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyTemplate } from './template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(SurveyTemplate)
    private templatesRepository: Repository<SurveyTemplate>,
  ) {}

  async findAll() {
    return this.templatesRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }
}
