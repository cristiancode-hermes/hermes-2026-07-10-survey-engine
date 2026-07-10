import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SurveyService } from '../../core/services/survey.service';
import { TemplateService } from '../../core/services/template.service';
import { ToastService } from '../../core/services/toast.service';
import { Survey, Template } from '../../core/models/types';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton/skeleton-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent, SkeletonCardComponent, DatePipe],
  template: `
    <app-header [userName]="userName()" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Banner -->
      @if (error()) {
        <div class="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex items-center justify-between">
          <span class="text-sm text-red-600">{{ error() }}</span>
          <button (click)="loadSurveys()" class="text-sm font-medium text-red-600 underline">Reintentar</button>
        </div>
      }

      <!-- Tab Filters -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex gap-1 p-1 rounded-lg" style="background-color: var(--color-bg-page); border: 1px solid var(--color-border);">
          @for (tab of tabs; track tab.value) {
            <button
              (click)="activeTab.set(tab.value)"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [style.background-color]="activeTab() === tab.value ? 'var(--color-bg-card)' : 'transparent'"
              [style.color]="activeTab() === tab.value ? 'var(--color-primary-600)' : 'var(--color-text-muted)'"
              [style.box-shadow]="activeTab() === tab.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <button (click)="showCreateModal.set(true)"
                class="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style="background-color: var(--color-primary-600);">
          + Crear encuesta
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <app-skeleton-card />
          }
        </div>
      } @else if (error()) {
        <!-- Error shown above -->
      } @else if (surveys().length === 0) {
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20">
          <div class="text-6xl mb-4">📋</div>
          <h2 class="text-xl font-semibold mb-2" style="color: var(--color-text-heading);">¡Crea tu primera encuesta!</h2>
          <p class="text-sm mb-6" style="color: var(--color-text-muted);">Comienza a recopilar feedback con encuestas profesionales.</p>
          <button (click)="showCreateModal.set(true)"
                  class="px-6 py-3 text-sm font-medium rounded-lg text-white"
                  style="background-color: var(--color-primary-600);">
            + Crear encuesta
          </button>
        </div>
      } @else {
        <!-- Survey Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (survey of surveys(); track survey.id) {
            <div class="rounded-xl border p-5 hover:shadow-md transition-shadow"
                 style="background-color: var(--color-bg-card); border-color: var(--color-border);">
              <div class="flex items-start gap-3 mb-3">
                <span class="text-2xl">{{ survey.emoji || '📝' }}</span>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-sm truncate" style="color: var(--color-text-heading);">{{ survey.title }}</h3>
                  <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">{{ survey.responseCount || 0 }} respuestas</p>
                </div>
              </div>

              <div class="flex items-center gap-2 mb-4">
                @if (survey.status === 'draft') {
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">Borrador</span>
                } @else if (survey.status === 'active') {
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Activa</span>
                } @else {
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Cerrada</span>
                }
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs" style="color: var(--color-text-muted);">{{ survey.createdAt | date:'shortDate' }}</span>
                <div class="relative" (click)="toggleMenu($event, survey.id)">
                  <button class="p-1.5 rounded-lg hover:opacity-80 text-sm" style="color: var(--color-text-muted);">•••</button>
                  @if (openMenuId() === survey.id) {
                    <div class="absolute right-0 bottom-full mb-1 w-36 rounded-lg shadow-lg border py-1 z-10"
                         style="background-color: var(--color-bg-card); border-color: var(--color-border);">
                      <button (click)="viewSurvey(survey.id)" class="block w-full text-left px-3 py-1.5 text-xs" style="color: var(--color-text-body);">Ver</button>
                      @if (survey.status === 'draft') {
                        <button (click)="editSurvey(survey.id)" class="block w-full text-left px-3 py-1.5 text-xs" style="color: var(--color-text-body);">Editar</button>
                      }
                      @if (survey.status === 'active' || survey.status === 'closed') {
                        <button (click)="viewResults(survey.id)" class="block w-full text-left px-3 py-1.5 text-xs" style="color: var(--color-text-body);">Resultados</button>
                      }
                      @if (survey.status === 'active') {
                        <button (click)="closeSurveyAction(survey.id)" class="block w-full text-left px-3 py-1.5 text-xs text-red-600">Cerrar</button>
                      }
                      <button (click)="deleteSurveyAction(survey.id)" class="block w-full text-left px-3 py-1.5 text-xs text-red-600">Eliminar</button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </main>

    <!-- Create Survey Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4" style="background-color: var(--color-bg-card);">
          <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text-heading);">Nueva encuesta</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Título</label>
              <input
                type="text"
                [value]="newTitle()"
                (input)="newTitle.set($any($event.target).value)"
                placeholder="Título de la encuesta"
                class="w-full px-4 py-2.5 text-sm rounded-lg border"
                style="background-color: var(--color-bg-page); border-color: var(--color-border); color: var(--color-text-body);"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Descripción</label>
              <textarea
                [value]="newDescription()"
                (input)="newDescription.set($any($event.target).value)"
                placeholder="Descripción opcional"
                rows="3"
                class="w-full px-4 py-2.5 text-sm rounded-lg border resize-none"
                style="background-color: var(--color-bg-page); border-color: var(--color-border); color: var(--color-text-body);"
              ></textarea>
            </div>

            <!-- Templates -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--color-text-body);">Plantillas</label>
              <div class="grid grid-cols-2 gap-2">
                @for (tpl of templates(); track tpl.id) {
                  <button
                    (click)="selectedTemplateId.set(tpl.id)"
                    class="p-3 rounded-lg border text-left text-sm transition-colors"
                    style="border-color: selectedTemplateId() === tpl.id ? 'var(--color-primary-500)' : 'var(--color-border)'; background-color: selectedTemplateId() === tpl.id ? 'var(--color-primary-50)' : 'transparent';"
                  >
                    <span class="text-lg">{{ tpl.emoji }}</span>
                    <p class="font-medium text-xs mt-1" style="color: var(--color-text-heading);">{{ tpl.name }}</p>
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="showCreateModal.set(false)"
                    class="px-4 py-2 text-sm font-medium rounded-lg border"
                    style="border-color: var(--color-border); color: var(--color-text-body);">
              Cancelar
            </button>
            <button (click)="createSurvey()"
                    [disabled]="!newTitle() || creating()"
                    class="px-4 py-2 text-sm font-medium rounded-lg text-white"
                    style="background-color: var(--color-primary-600);"
                    [class.opacity-60]="!newTitle() || creating()">
              @if (creating()) {
                Creando...
              } @else {
                Crear
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent {
  private surveyService = inject(SurveyService);
  private templateService = inject(TemplateService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly tabs = [
    { label: 'Todas', value: '' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Activas', value: 'active' },
    { label: 'Cerradas', value: 'closed' },
  ];

  readonly activeTab = signal('');
  readonly surveys = signal<Survey[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly userName = signal('Usuario');

  // Create modal
  readonly showCreateModal = signal(false);
  readonly newTitle = signal('');
  readonly newDescription = signal('');
  readonly selectedTemplateId = signal<string | null>(null);
  readonly creating = signal(false);
  readonly templates = signal<Template[]>([]);
  readonly openMenuId = signal<string | null>(null);

  constructor() {
    this.loadSurveys();
    this.loadTemplates();
  }

  loadSurveys() {
    this.loading.set(true);
    this.error.set(null);

    const filters: { status?: string } = {};
    if (this.activeTab()) filters.status = this.activeTab();

    this.surveyService.getSurveys(filters).subscribe({
      next: (data) => {
        this.surveys.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar encuestas');
        this.loading.set(false);
      },
    });
  }

  loadTemplates() {
    this.templateService.getTemplates().subscribe({
      next: (data) => this.templates.set(data),
      error: () => {
        // Provide default templates
        this.templates.set([
          { id: '1', name: 'Satisfacción', description: 'Mide la satisfacción general', emoji: '😊', questions: [] },
          { id: '2', name: 'Feedback producto', description: 'Recopila opiniones sobre tu producto', emoji: '📦', questions: [] },
          { id: '3', name: 'Evento', description: 'Feedback post-evento', emoji: '🎉', questions: [] },
          { id: '4', name: 'NPS', description: 'Net Promoter Score', emoji: '📊', questions: [] },
        ] as Template[]);
      },
    });
  }

  createSurvey() {
    if (!this.newTitle()) return;
    this.creating.set(true);

    this.surveyService.createSurvey({
      title: this.newTitle(),
      description: this.newDescription(),
      templateId: this.selectedTemplateId() || undefined,
    }).subscribe({
      next: (survey) => {
        this.toast.success('Encuesta creada exitosamente');
        this.showCreateModal.set(false);
        this.newTitle.set('');
        this.newDescription.set('');
        this.selectedTemplateId.set(null);
        this.creating.set(false);
        this.router.navigate([`/surveys/${survey.id}/edit`]);
      },
      error: () => {
        this.toast.error('Error al crear la encuesta');
        this.creating.set(false);
      },
    });
  }

  viewSurvey(id: string) {
    this.openMenuId.set(null);
    this.router.navigate([`/surveys/${id}/edit`]);
  }

  editSurvey(id: string) {
    this.openMenuId.set(null);
    this.router.navigate([`/surveys/${id}/edit`]);
  }

  viewResults(id: string) {
    this.openMenuId.set(null);
    this.router.navigate([`/surveys/${id}/results`]);
  }

  closeSurveyAction(id: string) {
    this.openMenuId.set(null);
    this.surveyService.closeSurvey(id).subscribe({
      next: () => {
        this.toast.success('Encuesta cerrada');
        this.loadSurveys();
      },
      error: () => this.toast.error('Error al cerrar la encuesta'),
    });
  }

  deleteSurveyAction(id: string) {
    this.openMenuId.set(null);
    if (confirm('¿Estás seguro de eliminar esta encuesta?')) {
      this.surveyService.deleteSurvey(id).subscribe({
        next: () => {
          this.toast.success('Encuesta eliminada');
          this.loadSurveys();
        },
        error: () => this.toast.error('Error al eliminar la encuesta'),
      });
    }
  }

  toggleMenu(event: MouseEvent, id: string) {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }
}
