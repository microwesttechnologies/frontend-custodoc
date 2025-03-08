import { Injectable } from '@angular/core';

import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserLocalService {
  public user!: User;
  public companySelected!: {
    id_company: number;
    type_company: 'IPS' | 'Otras';
    name: string;
    nit: string;
  };

  public menuSidebar: any[] = [];
}
