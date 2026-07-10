import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="rounded-xl border p-5 animate-pulse" style="background-color: var(--color-bg-card); border-color: var(--color-border);">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-secondary-200 dark:bg-secondary-700"></div>
        <div class="flex-1">
          <div class="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2"></div>
        </div>
      </div>
      <div class="flex gap-2 mb-3">
        <div class="h-5 bg-secondary-200 dark:bg-secondary-700 rounded-full w-16"></div>
        <div class="h-5 bg-secondary-200 dark:bg-secondary-700 rounded-full w-20"></div>
      </div>
      <div class="flex justify-between items-center">
        <div class="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-24"></div>
        <div class="h-8 bg-secondary-200 dark:bg-secondary-700 rounded w-20"></div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}
