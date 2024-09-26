import { Injectable } from '@angular/core';
import { GetAllUsersService } from 'Core/Infraestructura/driver-adapter/Services/GetAllUser.service';
import { Observable } from 'rxjs';
import { User } from '../Model/User.Model';

@Injectable({
  providedIn: 'root'
})
export class GetAllUserUseCases {
  constructor(private _userGateway: GetAllUsersService) { }

  getAllUser(): Observable<User[]> {
    return this._userGateway.getAllUsers();
  }
}