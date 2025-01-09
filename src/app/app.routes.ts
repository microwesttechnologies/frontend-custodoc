import { Routes } from '@angular/router';
import { LoginComponent } from './pages/public/login/login.component';
import { LoginGuard } from './guards/login.guard';
import { ResetPasswordComponent } from './pages/public/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  {
    component: ResetPasswordComponent,
    canActivate: [LoginGuard],
    path: 'reset-password',
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/private/Dashboard/dashboard.routes').then(
        (r) => r.DASHBOARD_ROUTES
      ),
  },
];
