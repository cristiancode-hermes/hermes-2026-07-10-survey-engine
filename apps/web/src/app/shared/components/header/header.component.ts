import { Component, input, output, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-40 border-b" style="background-color: var(--color-bg-card); border-color: var(--color-border);">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <a routerLink="/dashboard" class="flex items-center gap-2">
              <span class="text-2xl font-bold" style="color: var(--color-primary-600);">Hermes Survey</span>
            </a>
            @if (showSearch()) {
              <div class="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Buscar encuestas..."
                  [value]="searchQuery()"
                  (input)="search.emit($any($event.target).value)"
                  class="w-64 px-4 py-2 text-sm rounded-lg border"
                  style="background-color: var(--color-bg-page); border-color: var(--color-border); color: var(--color-text-body);"
                />
              </div>
            }
          </div>

          <div class="flex items-center gap-3">
            <button (click)="toggleDarkMode()"
                    class="p-2 rounded-lg hover:opacity-80"
                    style="background-color: var(--color-bg-page);">
              @if (isDark()) {
                <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
              } @else {
                <svg class="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              }
            </button>

            <div class="relative" (click)="toggleMenu()">
              <button class="flex items-center gap-2 p-2 rounded-lg hover:opacity-80"
                      style="background-color: var(--color-bg-page);">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                     style="background-color: var(--color-primary-600);">
                  {{ userName()?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
              </button>
              @if (menuOpen()) {
                <div class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50"
                     style="background-color: var(--color-bg-card); border-color: var(--color-border);">
                  <a routerLink="/settings" class="block px-4 py-2 text-sm" style="color: var(--color-text-body); hover:background-color: var(--color-bg-page);">
                    Configuración
                  </a>
                  <hr style="border-color: var(--color-border);">
                  <button (click)="logout()"
                          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Cerrar sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly showSearch = input(true);
  readonly searchQuery = input('');
  readonly userName = input<string | null>(null);
  readonly search = output<string>();
  readonly menuOpen = signal(false);
  readonly isDark = signal(false);

  private theme = inject(ThemeService);
  private auth = inject(AuthService);

  constructor() {
    this.isDark.set(this.theme.isDark());
  }

  toggleDarkMode() {
    this.theme.toggleDarkMode();
    this.isDark.set(this.theme.isDark());
  }

  toggleMenu() {
    this.menuOpen.update((v: boolean) => !v);
  }

  logout() {
    this.auth.logout();
    window.location.href = '/auth/login';
  }
}
