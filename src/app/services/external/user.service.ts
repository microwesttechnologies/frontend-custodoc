import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { GenericResponse } from 'src/app/models/global.model';
import { User } from 'src/app/models/user.model';
import { headerAuthorization } from '../local/helper.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}user`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${environment.apiUrl}login`, {
      email,
      password,
    });
  }

  logout(): Observable<GenericResponse> {
    return this.http.get<GenericResponse>(`${environment.apiUrl}logout`,headerAuthorization());
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, headerAuthorization());
  }

  createUser(user: User): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      user,
      headerAuthorization()
    );
  }

  getAllById(id_user: number): Observable<User> {
    return this.http.get<User>(
      `${environment.apiUrl}employees/${id_user}`,
      headerAuthorization()
    );
  }
}
