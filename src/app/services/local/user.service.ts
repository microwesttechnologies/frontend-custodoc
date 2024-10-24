import { Injectable } from '@angular/core';
import { User } from '../../models/User.Model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user!: User;
}
