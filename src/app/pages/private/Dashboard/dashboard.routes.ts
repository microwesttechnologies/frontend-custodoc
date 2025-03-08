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
        data: { id: 1 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./company-module/company-module.component').then(
            (c) => c.CompanyModuleComponent
          ),
      },
      {
        path: 'users',
        data: { id: 2 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./users-module/users-module.component').then(
            (c) => c.UsersModuleComponent
          ),
      },
      {
        path: 'customers',
        data: { id: 3 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./customers-module/customers-module.component').then(
            (c) => c.CustomersModuleComponent
          ),
      },
      {
        path: 'documents',
        data: { id: 4 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./documents/documents.component').then(
            (c) => c.DocumentsComponent
          ),
      },
      {
        path: 'ranking',
        data: { id: 5 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./ranking-module/ranking-module.component').then(
            (c) => c.RankingModuleComponent
          ),
      },
      {
        path: 'roles',
        data: { id: 7 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./roles/roles.component').then((c) => c.RolesComponent),
      },
      {
        path: 'trash',
        data: { id: 8 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./documents/trash/trash.component').then(
            (c) => c.TrashComponent
          ),
      },
      {
        path: 'chose-company',
        data: { id: 9 },
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./chose-company/chose-company.component').then(
            (c) => c.ChoseCompanyComponent
          ),
      },
      { path: '**', redirectTo: 'companies', pathMatch: 'full' },
    ],
  },
];
