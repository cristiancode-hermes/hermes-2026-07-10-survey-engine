import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white dark:bg-[var(--color-bg-card)] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
             style="background-color: var(--color-bg-card);">
          <h3 class="text-lg font-semibold mb-2" style="color: var(--color-text-heading);">{{ title() }}</h3>
          <p class="text-sm mb-6" style="color: var(--color-text-muted);">{{ message() }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="cancel()"
                    class="px-4 py-2 text-sm font-medium rounded-lg border"
                    style="border-color: var(--color-border); color: var(--color-text-body);">
              Cancelar
            </button>
            <button (click)="confirm()"
                    class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700">
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = signal(false);
  readonly title = signal('');
  readonly message = signal('');
  readonly confirmText = signal('Confirmar');

  private resolveFn: ((value: boolean) => void) | null = null;

  show(title: string, message: string, confirmText = 'Confirmar'): Promise<boolean> {
    this.title.set(title);
    this.message.set(message);
    this.confirmText.set(confirmText);
    this.isOpen.set(true);

    return new Promise(resolve => {
      this.resolveFn = resolve;
    });
  }

  confirm() {
    this.isOpen.set(false);
    this.resolveFn?.(true);
  }

  cancel() {
    this.isOpen.set(false);
    this.resolveFn?.(false);
  }
}
