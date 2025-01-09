import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserLocalService } from '../services/local/user.service';
import { isTokenExpired } from '../services/local/helper.service';
import { UserService } from '../services/external/user.service';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly userLocalService = inject(UserLocalService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const token = window.localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.userLocalService.user)
      this.userLocalService.user = jwtDecode(token);

    if (isTokenExpired(this.userLocalService.user)) {
      window.localStorage.removeItem('access_token');
      this.router.navigate(['/login']);
      return false;
    }

    if (!this.userLocalService.user?.email) await this.getUserProfile();
    return await this.getRoutesByRole(route);
  }

  private getUserProfile(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.userService.getUserProfile().subscribe({
        next: (user) => {
          Object.assign(this.userLocalService.user, user);
          resolve();
        },
      });
    });
  }

  private getRoutesByRole(route: ActivatedRouteSnapshot): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.userService.getRoutesByRole().subscribe({
        next: (response: any) => {
          this.userLocalService.allowedRouteIds = response?.allowedRouteIds;
          this.userLocalService.menuSidebar = response?.menu;

          const moduleId = route.data['id'];

          if (this.userLocalService.allowedRouteIds.includes(moduleId)) {
            return resolve(true);
          }

          // Redirigir al primer módulo permitido en el menú
          if (this.userLocalService.menuSidebar?.length > 0) {
            const firstPath =
              this.userLocalService.menuSidebar[0].items[0]?.path || '/';
            this.router.navigate([firstPath]);
            return resolve(true);
          }

          // Si no hay rutas permitidas, cerrar sesión
          window.localStorage.removeItem('access_token');
          this.router.navigate(['/login']);
          return resolve(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al validar permisos:', error);
          window.localStorage.removeItem('access_token');
          this.router.navigate(['/login']);
          return resolve(false);
        },
      });
    });
  }
}
