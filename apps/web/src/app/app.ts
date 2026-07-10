import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <app-toast [toasts]="toastService.toasts()" (dismiss)="toastService.dismiss($event)" />
  `,
})
export class App {
  constructor(public toastService: ToastService) {}
}
