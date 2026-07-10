import { Component, input, output } from '@angular/core';
import { ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      @for (toast of toasts(); track toast.id) {
        <div
          class="px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-slide-in min-w-72"
          [class.bg-green-600]="toast.type === 'success'"
          [class.bg-red-600]="toast.type === 'error'"
          [class.bg-blue-600]="toast.type === 'info'"
          [class.bg-amber-500]="toast.type === 'warning'"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="dismiss.emit(toast.id)" class="text-white/80 hover:text-white ml-2">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
  `],
})
export class ToastComponent {
  readonly toasts = input<ToastMessage[]>([]);
  readonly dismiss = output<string>();
}
