import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResultService } from '../../core/services/result.service';
import { SurveyService } from '../../core/services/survey.service';

@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen" style="background-color: var(--color-bg-page);">
      <div class="p-6 max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard" class="text-sm hover:underline" style="color: var(--color-primary-500);">&larr; Volver</a>
            <h1 class="text-xl font-bold" style="color: var(--color-text-heading);">{{ survey()?.title || 'Resultados' }}</h1>
          </div>
          <button (click)="copyLink()" class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style="border-color: var(--color-border); color: var(--color-text-body);"
            (mouseenter)="$event.bypass=true">
            🔗 Copiar link
          </button>
        </div>

        @if (loading()) {
          <div class="text-center py-12">
            <p style="color: var(--color-text-muted);">Cargando resultados...</p>
          </div>
        } @else if (error()) {
          <div class="text-center py-12">
            <p class="text-danger-500">{{ error() }}</p>
          </div>
        } @else {
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="p-6 rounded-xl shadow-sm" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
              <p class="text-sm" style="color: var(--color-text-muted);">Respuestas</p>
              <p class="text-3xl font-bold" style="color: var(--color-text-heading);">{{ kpis()?.totalResponses || 0 }}</p>
            </div>
            <div class="p-6 rounded-xl shadow-sm" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
              <p class="text-sm" style="color: var(--color-text-muted);">Completadas</p>
              <p class="text-3xl font-bold" style="color: var(--color-text-heading);">{{ kpis()?.completionRate || 0 }}%</p>
            </div>
            <div class="p-6 rounded-xl shadow-sm" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
              <p class="text-sm" style="color: var(--color-text-muted);">NPS</p>
              <p class="text-3xl font-bold" style="color: var(--color-text-heading);">{{ kpis()?.npsScore ?? '—' }}</p>
            </div>
          </div>

          <!-- No results -->
          @if ((kpis()?.totalResponses || 0) === 0) {
            <div class="text-center py-12 rounded-xl" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
              <p class="text-sm" style="color: var(--color-text-muted);">Aún no hay respuestas. Comparte el link de tu encuesta.</p>
              <button (click)="copyLink()" class="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style="background-color: var(--color-primary-500);">Copiar link</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SurveyResultsComponent {
  private route = inject(ActivatedRoute);
  private resultService = inject(ResultService);
  private surveyService = inject(SurveyService);

  readonly survey = signal<any>(null);
  readonly results = signal<any>(null);
  readonly kpis = signal<any>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  async load(id: string) {
    try {
      const survey = await this.surveyService.getSurvey(id);
      this.survey.set(survey);
      const res = await this.resultService.getResults(id);
      this.results.set(res);
      this.kpis.set(res.kpis);
    } catch (e) {
      this.error.set('Error al cargar resultados');
    }
    this.loading.set(false);
  }

  async copyLink() {
    const slug = this.survey()?.slug;
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(window.location.origin + '/survey/' + slug);
    } catch {}
  }
}
