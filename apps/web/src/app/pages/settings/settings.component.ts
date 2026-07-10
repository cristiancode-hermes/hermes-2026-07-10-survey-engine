import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen" style="background-color: var(--color-bg-page);">
      <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6" style="color: var(--color-text-heading);">Configuración</h1>

        <div class="p-6 rounded-xl shadow-sm mb-6" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
          <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text-heading);">Perfil</h2>
          <form (ngSubmit)="updateProfile()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Nombre</label>
              <input type="text" [(ngModel)]="name" name="name" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);">
            </div>
            <button type="submit"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style="background-color: var(--color-primary-500);">Guardar cambios</button>
          </form>
        </div>

        <div class="p-6 rounded-xl shadow-sm" style="background-color: var(--color-bg-card); border: 1px solid var(--color-border);">
          <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text-heading);">Cambiar Contraseña</h2>
          <form (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Contraseña actual</label>
              <input type="password" [(ngModel)]="currentPassword" name="currentPassword" required
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--color-text-body);">Nueva contraseña</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" required minlength="8"
                class="w-full px-3 py-2.5 rounded-lg border text-sm"
                style="border-color: var(--color-border); background-color: var(--color-bg-input); color: var(--color-text-body);">
            </div>
            <button type="submit"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style="background-color: var(--color-primary-500);">Cambiar contraseña</button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private auth = inject(AuthService);
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);

  readonly name = signal('');
  readonly email = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');

  constructor() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.name.set(user.name || '');
        this.email.set(user.email || '');
      } catch {}
    }
  }

  async updateProfile() {
    try {
      await this.settingsService.updateProfile(this.name(), this.email());
      this.toast.success('Perfil actualizado');
    } catch (e) {
      this.toast.error('Error al actualizar perfil');
    }
  }

  async changePassword() {
    try {
      await this.settingsService.changePassword(this.currentPassword(), this.newPassword());
      this.toast.success('Contraseña cambiada exitosamente');
      this.currentPassword.set('');
      this.newPassword.set('');
    } catch (e) {
      this.toast.error('Error al cambiar contraseña');
    }
  }
}
