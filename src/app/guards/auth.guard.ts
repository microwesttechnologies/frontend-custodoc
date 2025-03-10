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
import { HttpErrorResponse } from '@angular/common/http';
import { RoutesService } from '../services/external/routes.service';
import { NotificationService } from '../shared-components/notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly notificationService = inject(NotificationService);
  private readonly userLocalService = inject(UserLocalService);
  private readonly routesService = inject(RoutesService);
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
      this.routesService.getRoutesByRole().subscribe({
        next: (menu: any) => {
          this.userLocalService.menuSidebar = menu;
          const allowedRouteIds = this.userLocalService.menuSidebar.map((item: any) => item.id_route);
          const moduleId = route.data['id'];

          if (allowedRouteIds.includes(moduleId)) {
            if (this.userLocalService?.user?.id_rol === 4) {
              this.userLocalService.companySelected = JSON.parse(
                window.localStorage.getItem('company')!
              );
              if (
                moduleId === 4 &&
                !this.userLocalService.companySelected?.id_company
              ) {
                this.router.navigate(['/chose-company']);
                this.notificationService.showNotification(
                  'No puedes ingresar al modulo de documentos hasta seleccionar una compañía',
                  'danger'
                );
              }

              if (this.userLocalService?.companySelected?.type_company === 'Otras') {
                const module = this.userLocalService.menuSidebar?.find(module=>module.code === 'CUSTOMER');
                if(module) module.hidden = true;
              }
            }

            return resolve(true);
          }

          // Redirigir al primer módulo permitido en el menú
          if (menu?.length > 0) {
            const firstPath = menu[0]?.path || '/';
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
