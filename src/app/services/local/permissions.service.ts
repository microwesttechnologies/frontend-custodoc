import { inject, Injectable } from '@angular/core';
import { UserLocalService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private permissions = {
    companies: {
      roles: [1],
    },
    users: {
      roles: [1, 2],
    },
    customers: {
      roles: [1, 2],
    },
    documents: {
      roles: [1, 2, 3],
    },
  };

  private userLocalService = inject(UserLocalService);

  public validatePermissions(
    key: 'companies' | 'users' | 'customers' | 'documents'
  ): boolean {
    return this.permissions[key].roles.includes(
      this.userLocalService.user.id_rol as number
    );
  }
}
