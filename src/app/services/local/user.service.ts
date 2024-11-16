import { Injectable } from '@angular/core';

import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserLocalService {
  public user!: User;

  public allowedRouteIds: number[] = [];
  public menuSidebar: any[] = [];
}
