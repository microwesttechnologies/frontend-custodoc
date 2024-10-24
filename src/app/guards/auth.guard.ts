import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../services/local/user.service';
import { isTokenExpired } from '../services/local/helper.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      this.userService.user = jwtDecode(token);
    }

    if (token && !isTokenExpired(this.userService.user)) {
      // Si el token existe y NO ha expirado, permite el acceso
      return true;
    }

    // Si no hay token o ha expirado, redirige al login y borra el token
    window.localStorage.removeItem('access_token');
    this.router.navigate(['/login']);

    return false;
  }
}
