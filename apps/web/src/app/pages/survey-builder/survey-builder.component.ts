import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SurveyService } from '../../core/services/survey.service';
import { QuestionService } from '../../core/services/question.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-survey-builder',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="min-h-screen" style="background-color: var(--color-bg-page);">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard" class="text-sm hover:underline" style="color: var(--color-primary-500);">&larr; Volver</a>
            <h1 class="text-xl font-bold" style="color: var(--color-text-heading);">{{ survey()?.title || 'Cargando...' }}</h1>
            <span class="text-xs px-2 py-1 rounded-full" [class.text-green-600]="saveStatus() === 'saved'"
              [class.text-amber-600]="saveStatus() === 'saving'"
              style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
              {{ saveStatus() === 'saved' ? '💾 Guardado' : saveStatus() === 'saving' ? '⏳ Guardando...' : '' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button (click)="publish()" [disabled]="publishing()"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white"
              [class.opacity-50]="publishing()"
              style="background-color: var(--color-primary-500);">
              {{ publishing() ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <!-- Three-panel layout placeholder -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left: Question Palette -->
          <div class="col-span-3 p-4 rounded-xl" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
            <h3 class="text-sm font-semibold mb-3" style="color: var(--color-text-heading);">Tipos de Pregunta</h3>
            <div class="space-y-2">
              @for (type of questionTypes; track type.id) {
                <button (click)="addQuestion(type.id)"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-primary-50"
                  style="color: var(--color-text-body);">
                  {{ type.icon }} {{ type.label }}
                </button>
              }
            </div>
          </div>

          <!-- Center: Preview -->
          <div class="col-span-6 p-4 rounded-xl" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
            @if (questions().length === 0) {
              <div class="text-center py-12">
                <p class="text-sm" style="color: var(--color-text-muted);">Agrega tu primera pregunta desde el panel izquierdo</p>
              </div>
            } @else {
              @for (q of questions(); track q.id; let i = $index) {
                <div class="mb-4 p-4 rounded-lg border-2 cursor-pointer transition-colors"
                  [class.border-primary-300]="selectedQuestion()?.id === q.id"
                  style="border-color: var(--color-border);"
                  (click)="selectQuestion(q)">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium" style="color: var(--color-text-muted);">{{ i + 1 }}. {{ getTypeLabel(q.type) }}</span>
                    <button (click)="deleteQuestion(q.id)" class="text-xs text-danger-500 hover:underline">Eliminar</button>
                  </div>
                  <p class="text-sm font-medium" style="color: var(--color-text-body);">{{ q.label }}</p>
                </div>
              }
            }
          </div>

          <!-- Right: Properties -->
          <div class="col-span-3 p-4 rounded-xl" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
            @if (selectedQuestion()) {
              <h3 class="text-sm font-semibold mb-3" style="color: var(--color-text-heading);">Propiedades</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-medium mb-1" style="color: var(--color-text-body);">Texto</label>
                  <textarea [value]="selectedQuestion()?.label"
                    class="w-full px-3 py-2 rounded-lg border text-sm"
                    style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                    rows="2" (input)="updateLabel($event)"></textarea>
                </div>
                <label class="flex items-center gap-2 text-sm" style="color: var(--color-text-body);">
                  <input type="checkbox" [checked]="selectedQuestion()?.required"
                    (change)="toggleRequired()" class="rounded">
                  Requerida
                </label>
              </div>
            } @else {
              <p class="text-sm" style="color: var(--color-text-muted);">Selecciona una pregunta para editar</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SurveyBuilderComponent {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private questionService = inject(QuestionService);
  private toast = inject(ToastService);

  readonly survey = signal<any>(null);
  readonly questions = signal<any[]>([]);
  readonly selectedQuestion = signal<any>(null);
  readonly saveStatus = signal<'saved' | 'saving'>('saved');
  readonly publishing = signal(false);

  readonly questionTypes = [
    { id: 'text', icon: '✏️', label: 'Texto' },
    { id: 'single_choice', icon: '○', label: 'Opción Única' },
    { id: 'multiple_choice', icon: '☑️', label: 'Multiple' },
    { id: 'rating', icon: '⭐', label: 'Rating' },
    { id: 'yes_no', icon: '👍', label: 'Sí/No' },
    { id: 'dropdown', icon: '▼', label: 'Dropdown' },
    { id: 'nps', icon: '📊', label: 'NPS' },
  ];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadSurvey(id);
  }

  async loadSurvey(id: string) {
    try {
      const res = await this.surveyService.getSurvey(id);
      this.survey.set(res);
      if (res.questions) this.questions.set(res.questions);
    } catch (e) {
      this.toast.error('Error al cargar encuesta');
    }
  }

  getTypeLabel(type: string): string {
    return this.questionTypes.find(t => t.id === type)?.label || type;
  }

  async addQuestion(type: string) {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      await this.questionService.addQuestion(id, { type, label: 'Nueva pregunta', required: false });
      this.saveStatus.set('saved');
      this.loadSurvey(id);
    } catch (e) {
      this.toast.error('Error al agregar pregunta');
    }
    this.saveStatus.set('saving');
    setTimeout(() => this.saveStatus.set('saved'), 500);
  }

  selectQuestion(q: any) { this.selectedQuestion.set(q); }

  async deleteQuestion(qid: string) {
    try {
      await this.questionService.deleteQuestion(qid);
      this.loadSurvey(this.route.snapshot.paramMap.get('id')!);
      this.toast.success('Pregunta eliminada');
    } catch (e) {
      this.toast.error('Error al eliminar pregunta');
    }
  }

  updateLabel(e: Event) {
    const q = this.selectedQuestion();
    if (!q) return;
    q.label = (e.target as HTMLTextAreaElement).value;
  }

  async toggleRequired() {
    const q = this.selectedQuestion();
    if (!q) return;
    try {
      await this.questionService.updateQuestion(q.id, { required: !q.required });
      q.required = !q.required;
      this.saveStatus.set('saved');
    } catch (e) {
      this.toast.error('Error al actualizar');
    }
  }

  async publish() {
    if (this.questions().length === 0) {
      this.toast.error('Agrega al menos una pregunta');
      return;
    }
    const id = this.route.snapshot.paramMap.get('id')!;
    this.publishing.set(true);
    try {
      await this.surveyService.publishSurvey(id);
      this.toast.success('Encuesta publicada');
      this.loadSurvey(id);
    } catch (e) {
      this.toast.error('Error al publicar');
    }
    this.publishing.set(false);
  }
}
