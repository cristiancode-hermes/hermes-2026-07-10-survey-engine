import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'surveys/:id/edit',
    loadComponent: () => import('./pages/survey-builder/survey-builder.component').then(m => m.SurveyBuilderComponent),
    canActivate: [authGuard],
  },
  {
    path: 'surveys/:id/results',
    loadComponent: () => import('./pages/survey-results/survey-results.component').then(m => m.SurveyResultsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'survey/:slug',
    loadComponent: () => import('./pages/public-survey/public-survey.component').then(m => m.PublicSurveyComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
