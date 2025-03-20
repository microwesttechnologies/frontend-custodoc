import { PreviewFileComponent } from './pages/private/Dashboard/documents/preview-file/preview-file.component';
import { ResetPasswordComponent } from './pages/public/reset-password/reset-password.component';
import { LoginComponent } from './pages/public/login/login.component';
import { LoginGuard } from './guards/login.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  {
    component: ResetPasswordComponent,
    canActivate: [LoginGuard],
    path: 'reset-password',
  },
  {
    component: PreviewFileComponent,
    path: 'preview-file/:id',
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/private/Dashboard/dashboard.routes').then(
        (r) => r.DASHBOARD_ROUTES
      ),
  },
];
