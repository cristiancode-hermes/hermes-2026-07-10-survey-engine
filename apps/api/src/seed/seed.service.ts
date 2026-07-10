import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Survey } from '../surveys/survey.entity';
import { Question } from '../questions/question.entity';
import { SurveyTemplate } from '../templates/template.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Organization)
    private orgsRepository: Repository<Organization>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(SurveyTemplate)
    private templatesRepository: Repository<SurveyTemplate>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.usersRepository.count();
    if (count > 0) return; // Already seeded

    // Create templates first
    const templates = [
      {
        id: 'tpl-nps',
        name: 'Net Promoter Score (NPS)',
        description: 'Mide la lealtad de tus clientes con la pregunta clásica de NPS',
        category: 'nps',
        questions: [
          { type: 'nps', label: '¿Qué tan probable es que nos recomiendes a un amigo o colega?', required: true, position: 0, settings: { detractorLabel: 'Nada probable', promoterLabel: 'Muy probable' } },
          { type: 'text', label: '¿Cuál es la razón principal de tu puntuación?', required: false, position: 1, settings: { maxLength: 500 } },
          { type: 'rating', label: '¿Cómo calificarías tu experiencia general?', required: true, position: 2, settings: { maxRating: 5, leftLabel: 'Mala', rightLabel: 'Excelente' } },
        ] as any[],
      },
      {
        id: 'tpl-satisfaction',
        name: 'Satisfacción del Cliente',
        description: 'Encuesta completa de satisfacción post-servicio o post-compra',
        category: 'satisfaction',
        questions: [
          { type: 'single_choice', label: '¿Cómo conociste nuestro servicio?', options: ['Redes sociales', 'Google', 'Recomendación', 'Otro'], required: true, position: 0 },
          { type: 'rating', label: '¿Qué tan satisfecho estás con nuestro servicio?', required: true, position: 1, settings: { maxRating: 5, leftLabel: 'Muy insatisfecho', rightLabel: 'Muy satisfecho' } },
          { type: 'yes_no', label: '¿Recomendarías nuestro servicio a otros?', required: true, position: 2 },
          { type: 'text', label: '¿Qué podríamos mejorar?', required: false, position: 3, settings: { maxLength: 1000 } },
        ] as any[],
      },
      {
        id: 'tpl-event',
        name: 'Feedback de Evento',
        description: 'Recopila opiniones después de un evento, taller o conferencia',
        category: 'event',
        questions: [
          { type: 'rating', label: 'Calificación general del evento', required: true, position: 0, settings: { maxRating: 5, leftLabel: 'Malo', rightLabel: 'Excelente' } },
          { type: 'single_choice', label: '¿Cómo te enteraste del evento?', options: ['Email', 'Redes sociales', 'Boca a boca', 'Otro'], required: true, position: 1 },
          { type: 'multiple_choice', label: '¿Qué sesiones disfrutaste más?', options: ['Keynote', 'Talleres', 'Networking', 'Paneles'], required: false, position: 2 },
          { type: 'text', label: 'Comentarios adicionales', required: false, position: 3 },
        ] as any[],
      },
    ];

    for (const tpl of templates) {
      await this.templatesRepository.save(tpl as any);
    }

    // Create organizations
    const acme = await this.orgsRepository.save({ id: 'org-acme', name: 'Acme Corp' } as any);
    const startup = await this.orgsRepository.save({ id: 'org-startup', name: 'Startup Inc' } as any);

    // Create users
    const acmeUser = await this.usersRepository.save({
      id: 'usr-acme',
      organizationId: 'org-acme',
      name: 'Admin Acme',
      email: 'admin@acme.com',
      passwordHash: await bcrypt.hash('password123', 10),
    } as any);

    const startupUser = await this.usersRepository.save({
      id: 'usr-startup',
      organizationId: 'org-startup',
      name: 'User Startup',
      email: 'user@startup.io',
      passwordHash: await bcrypt.hash('password123', 10),
    } as any);

    // Create surveys for Acme
    const survey1 = await this.surveysRepository.save({
      id: 'svy-nps',
      organizationId: 'org-acme',
      title: 'Encuesta NPS Anual',
      description: 'Ayúdanos a medir nuestra satisfacción general',
      slug: 'nps-anual-a1b2',
      status: 'active',
      responseCount: 8,
      completionRate: 0.875,
      publishedAt: new Date('2026-07-01'),
    } as any);

    const survey2 = await this.surveysRepository.save({
      id: 'svy-satisfaction',
      organizationId: 'org-acme',
      title: 'Satisfacción del Cliente',
      description: 'Queremos conocer tu opinión sobre nuestro servicio',
      slug: 'satisfaccion-cliente-c3d4',
      status: 'active',
      responseCount: 5,
      completionRate: 1.0,
      publishedAt: new Date('2026-07-05'),
    } as any);

    const survey3 = await this.surveysRepository.save({
      id: 'svy-draft',
      organizationId: 'org-acme',
      title: 'Feedback de Producto (Borrador)',
      description: 'Encuesta interna para nuevo producto',
      slug: 'feedback-producto-e5f6',
      status: 'draft',
    } as any);

    // Questions for Survey 1 (NPS)
    await this.questionsRepository.save([
      { id: 'q-nps-1', surveyId: 'svy-nps', type: 'nps', label: '¿Qué tan probable es que nos recomiendes?', required: true, position: 0, settings: {} } as any,
      { id: 'q-nps-2', surveyId: 'svy-nps', type: 'text', label: '¿Cuál es la razón?', required: false, position: 1, settings: { maxLength: 500 } } as any,
      { id: 'q-nps-3', surveyId: 'svy-nps', type: 'rating', label: 'Calificación general', required: true, position: 2, settings: { maxRating: 5 } } as any,
    ]);

    // Questions for Survey 2 (Satisfaction)
    await this.questionsRepository.save([
      { id: 'q-sat-1', surveyId: 'svy-satisfaction', type: 'single_choice', label: '¿Cómo conociste nuestro servicio?', options: ['Redes sociales', 'Google', 'Recomendación', 'Otro'], required: true, position: 0 } as any,
      { id: 'q-sat-2', surveyId: 'svy-satisfaction', type: 'rating', label: '¿Qué tan satisfecho estás?', required: true, position: 1, settings: { maxRating: 5 } } as any,
      { id: 'q-sat-3', surveyId: 'svy-satisfaction', type: 'yes_no', label: '¿Recomendarías?', required: true, position: 2 } as any,
      { id: 'q-sat-4', surveyId: 'svy-satisfaction', type: 'text', label: 'Comentarios adicionales', required: false, position: 3 } as any,
    ]);

    // Questions for Survey 3 (Draft)
    await this.questionsRepository.save([
      { id: 'q-drf-1', surveyId: 'svy-draft', type: 'multiple_choice', label: '¿Qué funcionalidades te gustaría ver?', options: ['Chat', 'API', 'Exportar', 'Templates'], required: true, position: 0 } as any,
      { id: 'q-drf-2', surveyId: 'svy-draft', type: 'text', label: 'Sugerencias adicionales', required: false, position: 1 } as any,
    ]);
  }
}
