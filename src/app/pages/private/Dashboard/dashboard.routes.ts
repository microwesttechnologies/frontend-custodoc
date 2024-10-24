import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from '../../../guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'company',
        loadComponent: () =>
          import('./company-module/company-module.component').then(
            (c) => c.CompanyModuleComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./history-module/history-module.component').then(
            (c) => c.HistoryModuleComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users-module/users-module.component').then(
            (c) => c.UsersModuleComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./customers-module/customers-module.component').then(
            (c) => c.CustomersModuleComponent
          ),
      },
      { path: '', redirectTo: 'company', pathMatch: 'full' },
    ],
  },
];
