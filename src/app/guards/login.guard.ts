import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserLocalService } from '../services/local/user.service';
import { isTokenExpired } from '../services/local/helper.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard {
  private readonly userLocalService = inject(UserLocalService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      this.userLocalService.user = jwtDecode(token);
    }

    if (token && !isTokenExpired(this.userLocalService.user)) {
      // Si hay un token válido, redirigir al dashboard
      this.router.navigate(['/']);
      return false; // No permite el acceso a la página de login
    }

    window.localStorage.removeItem('access_token');
    return true; // Si no hay token o está expirado, permite el acceso
  }
}
