import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4" style="background-color: var(--color-bg-page);">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold" style="color: var(--color-primary-600);">Hermes Survey</h1>
          <p class="mt-2 text-sm" style="color: var(--color-text-muted);">Crea tu cuenta</p>
        </div>

        <div class="p-8" style="background-color: var(--color-bg-card); border-color: var(--color-border);" class="rounded-xl shadow-md border">
          @if (error()) {
            <div class="mb-4 p-3 rounded-lg text-sm bg-danger-50 text-danger-600 border border-danger-100">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Nombre</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                placeholder="Tu nombre">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                placeholder="tu@email.com">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Contraseña</label>
              <input type="password" [(ngModel)]="password" name="password" required minlength="8"
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                placeholder="Mínimo 8 caracteres">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Confirmar Contraseña</label>
              <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);"
                placeholder="Repite la contraseña">
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-colors"
              [class.opacity-50]="loading()"
              style="background-color: var(--color-primary-500);"
              (mouseenter)="onHover($event)"
              (mouseleave)="onLeave($event)">
              {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm" style="color: var(--color-text-muted);">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login" style="color: var(--color-primary-500);" class="font-medium hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  async onSubmit() {
    if (!this.name() || !this.email() || !this.password()) return;

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.register(this.name(), this.email(), this.password());
      await this.router.navigate(['/dashboard']);
      this.toast.success('Cuenta creada exitosamente');
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al crear cuenta');
      this.loading.set(false);
    }
  }

  onHover(e: MouseEvent) {
    (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-600)';
  }
  onLeave(e: MouseEvent) {
    (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-500)';
  }
}
