import { Routes } from '@angular/router';
import { LoginComponent } from './pages/public/login/login.component';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  {
    path: '',
    loadChildren: () =>
      import('./pages/private/Dashboard/dashboard.routes').then(
        (r) => r.DASHBOARD_ROUTES
      ),
  },
];
