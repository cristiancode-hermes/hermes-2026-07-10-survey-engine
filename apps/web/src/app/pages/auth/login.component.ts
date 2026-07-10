import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4" style="background-color: var(--color-bg-page);">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold" style="color: var(--color-primary-600);">Hermes Survey</h1>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted);">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Card -->
        <div class="rounded-xl shadow-sm border p-8" style="background-color: var(--color-bg-card); border-color: var(--color-border);">
          @if (error()) {
            <div class="mb-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Email</label>
              <input
                type="email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                placeholder="tu@email.com"
                required
                class="w-full px-4 py-2.5 text-sm rounded-lg border"
                style="background-color: var(--color-bg-page); border-color: var(--color-border); color: var(--color-text-body);"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Contraseña</label>
              <input
                type="password"
                [value]="password()"
                (input)="password.set($any($event.target).value)"
                placeholder="••••••••"
                required
                class="w-full px-4 py-2.5 text-sm rounded-lg border"
                style="background-color: var(--color-bg-page); border-color: var(--color-border); color: var(--color-text-body);"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-colors"
              style="background-color: var(--color-primary-600);"
              [class.opacity-60]="loading()"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Iniciando sesión...
                </span>
              } @else {
                Iniciar sesión
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm" style="color: var(--color-text-muted);">
            ¿No tienes cuenta?
            <a routerLink="/auth/register" class="font-medium" style="color: var(--color-primary-600);">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  async onSubmit() {
    if (!this.email() || !this.password()) return;
    this.loading.set(true);
    this.error.set(null);

    try {
      await new Promise<void>((resolve, reject) => {
        this.auth.login(this.email(), this.password()).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      });
      this.toast.success('Inicio de sesión exitoso');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      this.loading.set(false);
    }
  }
}
