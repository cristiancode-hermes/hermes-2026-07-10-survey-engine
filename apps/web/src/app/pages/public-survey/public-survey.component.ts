import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResponseService } from '../../core/services/response.service';

@Component({
  selector: 'app-public-survey',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-start justify-center px-4 py-12" style="background-color: var(--color-bg-page);">
      <div class="w-full max-w-2xl">
        @if (closed()) {
          <div class="p-4 mb-6 rounded-lg bg-warning-100 text-warning-600 text-sm font-medium">
            Esta encuesta ya no está activa
          </div>
        }

        @if (submitted()) {
          <div class="text-center py-12 rounded-xl" style="background-color: var(--color-bg-card);">
            <h2 class="text-2xl font-bold mb-2" style="color: var(--color-text-heading);">Gracias por tu participacion!</h2>
            <p style="color: var(--color-text-muted);">Tus respuestas han sido registradas.</p>
          </div>
        } @else if (notFound()) {
          <div class="text-center py-12">
            <h2 class="text-2xl font-bold" style="color: var(--color-text-heading);">Encuesta no encontrada</h2>
          </div>
        } @else {
          <div class="p-8 rounded-xl shadow-sm" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
            <h1 class="text-2xl font-bold mb-2" style="color: var(--color-text-heading);">{{ survey()?.title }}</h1>
            @if (survey()?.description) {
              <p class="text-sm mb-8" style="color: var(--color-text-muted);">{{ survey()?.description }}</p>
            }

            @for (q of questions(); track q.id; let i = $index) {
              <div class="mb-6">
                <p class="font-medium mb-2 text-base" style="color: var(--color-text-body);">{{ i + 1 }}. {{ q.label }}</p>
                @if (q.required) { <span class="text-danger-500 text-xs">* Requerido</span> }

                @switch (q.type) {
                  @case ('text') {
                    <textarea class="w-full px-3 py-2 rounded-lg border text-sm"
                      style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                      rows="3" [value]="answers()[q.id] || ''"
                      (input)="onTextInput(q.id, $event)"></textarea>
                  }
                  @case ('single_choice') {
                    <div class="space-y-2 mt-2">
                      @for (opt of q.options; track opt) {
                        <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text-body);">
                          <input type="radio" name="q-{{q.id}}" [value]="opt"
                            (change)="setAnswer(q.id, opt)" class="accent-primary-500">
                          {{ opt }}
                        </label>
                      }
                    </div>
                  }
                  @case ('rating') {
                    <div class="flex gap-2 mt-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button (click)="setAnswer(q.id, star)"
                          class="w-10 h-10 rounded-full text-lg transition-transform hover:scale-110"
                          [class.bg-primary-100]="(answers()[q.id] || 0) >= star">
                          {{ star <= (answers()[q.id] || 0) ? '\u2B50' : '\u2606' }}
                        </button>
                      }
                    </div>
                  }
                  @case ('yes_no') {
                    <div class="flex gap-2 mt-2">
                      <button (click)="setAnswer(q.id, 'S\u00ED')"
                        class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                        [class.bg-success-100]="answers()[q.id] === 'S\u00ED'"
                        style="border-color: var(--color-border);">Si</button>
                      <button (click)="setAnswer(q.id, 'No')"
                        class="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                        [class.bg-danger-100]="answers()[q.id] === 'No'"
                        style="border-color: var(--color-border);">No</button>
                    </div>
                  }
                  @case ('nps') {
                    <div class="flex gap-1 mt-2">
                      @for (n of npsRange; track n) {
                        <button (click)="setAnswer(q.id, n)"
                          class="w-8 h-10 rounded text-xs font-bold transition-colors"
                          [class.text-white]="answers()[q.id] === n"
                          [style.background-color]="n <= 6 ? '#ef4444' : n <= 8 ? '#f59e0b' : '#22c55e'"
                          [class.opacity-40]="answers()[q.id] !== n && answers()[q.id] !== undefined">
                          {{ n }}
                        </button>
                      }
                    </div>
                  }
                  @default {
                    <p class="text-xs mt-1" style="color: var(--color-text-muted);">Tipo: {{ q.type }}</p>
                  }
                }
              </div>
            }

            @if (validationError()) {
              <p class="text-danger-500 text-sm mb-4">{{ validationError() }}</p>
            }

            <button (click)="submit()" [disabled]="submitting()"
              class="w-full py-3 px-4 rounded-lg text-sm font-medium text-white transition-opacity"
              [class.opacity-50]="submitting()"
              style="background-color: var(--color-primary-500);">
              {{ submitting() ? 'Enviando...' : 'Enviar respuestas' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class PublicSurveyComponent {
  private route = inject(ActivatedRoute);
  private responseService = inject(ResponseService);

  readonly survey = signal<any>(null);
  readonly questions = signal<any[]>([]);
  readonly answers = signal<Record<string, any>>({});
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly closed = signal(false);
  readonly notFound = signal(false);
  readonly validationError = signal<string | null>(null);

  readonly npsRange = [0,1,2,3,4,5,6,7,8,9,10];

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.load(slug);
  }

  async load(slug: string) {
    try {
      const res: any = await this.responseService.getSurveyBySlug(slug);
      this.survey.set(res.survey || res);
      this.questions.set(res.questions || []);
    } catch (e: any) {
      if (e?.status === 404) this.notFound.set(true);
      else this.closed.set(true);
    }
  }

  onTextInput(questionId: string, event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.setAnswer(questionId, value);
  }

  setAnswer(questionId: string, value: any) {
    this.answers.update(a => ({ ...a, [questionId]: value }));
  }

  async submit() {
    this.validationError.set(null);
    const missing = this.questions().filter(q => q.required && !this.answers()[q.id]);
    if (missing.length > 0) {
      this.validationError.set('Responde todas las preguntas requeridas');
      return;
    }

    this.submitting.set(true);
    try {
      const surveyId = this.survey().id;
      const answersList = Object.entries(this.answers()).map(([questionId, value]) => ({ questionId, value }));
      await this.responseService.submitResponse(surveyId, answersList as any);
      this.submitted.set(true);
    } catch {
      this.validationError.set('Error al enviar. Intenta de nuevo.');
    }
    this.submitting.set(false);
  }
}
