import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4" style="background-color: var(--color-bg-page);">
      <div class="text-center">
        <h1 class="text-6xl font-bold mb-4" style="color: var(--color-primary-500);">404</h1>
        <h2 class="text-2xl font-semibold mb-2" style="color: var(--color-text-heading);">Página no encontrada</h2>
        <p class="mb-6" style="color: var(--color-text-muted);">La página que buscas no existe o ha sido movida.</p>
        <a routerLink="/dashboard"
          class="inline-block px-6 py-3 rounded-lg text-sm font-medium text-white"
          style="background-color: var(--color-primary-500);">Ir al Dashboard</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
