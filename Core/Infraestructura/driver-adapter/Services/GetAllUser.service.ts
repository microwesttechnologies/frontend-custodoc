import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'Core/Config/Enviroment';
import { GetAllUserGateway } from 'Core/Domain/Gateway/GetAllUser.Gateway';
import { User } from 'Core/Domain/Model/User.Model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetAllUsersService implements GetAllUserGateway {
  private apiUrl = `${environment.apiUrl}users`
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
