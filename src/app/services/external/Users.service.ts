import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { GenericResponse } from '../../models/global.model';
import { User } from '../../models/User.Model';
import { headerAuthorization } from '../local/helper.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}users`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${environment.apiUrl}login`, {
      email,
      password,
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, headerAuthorization());
  }

  createUser(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.apiUrl, user, headerAuthorization());
  }

  getAllById(id_user: number): Observable<User> {
    return this.http.get<User>(
      `${environment.apiUrl}employees/${id_user}`,
      headerAuthorization()
    );
  }
}
