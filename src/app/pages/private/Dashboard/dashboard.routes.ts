import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'companies',
        data: { id: 2 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./company-module/company-module.component').then(
            (c) => c.CompanyModuleComponent
          ),
      },
      {
        path: 'documents',
        data: { id: 7 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./history-module/history-module.component').then(
            (c) => c.HistoryModuleComponent
          ),
      },
      {
        path: 'users',
        data: { id: 4 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./users-module/users-module.component').then(
            (c) => c.UsersModuleComponent
          ),
      },
      {
        path: 'customers',
        data: { id: 5 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./customers-module/customers-module.component').then(
            (c) => c.CustomersModuleComponent
          ),
      },
      {
        path: 'ranking',
        data: { id: 8 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./ranking-module/ranking-module.component').then(
            (c) => c.RankingModuleComponent
          ),
      },
      { path: '', redirectTo: 'companies', pathMatch: 'full' },
      { path: '**', redirectTo: 'companies', pathMatch: 'full' },
    ],
  },
];
