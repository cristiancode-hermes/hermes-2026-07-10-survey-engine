import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isDarkSignal = signal<boolean>(localStorage.getItem('theme') === 'dark');

  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkSignal.update(v => !v);
    localStorage.setItem('theme', this.isDarkSignal() ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkSignal()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
