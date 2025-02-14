import { Injectable } from '@angular/core';
import { Observable, range } from 'rxjs';
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

  sendLinkResetPassword(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${environment.apiUrl}sendLinkResetPassword`,
      {
        email,
      }
    );
  }

  resetPassword(password: string, token: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${environment.apiUrl}resetPassword`,
      {
        token,
        password,
      }
    );
  }

  validateIfTokenIsValid(token: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${environment.apiUrl}validateIfTokenIsValid`,
      {
        token,
      }
    );
  }

  logout(): Observable<GenericResponse> {
    return this.http.get<GenericResponse>(
      `${environment.apiUrl}logout`,
      headerAuthorization()
    );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/getUserProfile`,
      headerAuthorization()
    );
  }

  getAllUsers(id_company?: number): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}${id_company ? `/${id_company}` : ''}`,
      headerAuthorization()
    );
  }

  getAllRankingUsers(rangeDates: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/getAllRankingUsers${
        rangeDates ? '?rangeDates=' + rangeDates : ''
      }`,
      headerAuthorization()
    );
  }

  createUser(user: User): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      user,
      headerAuthorization()
    );
  }

  updateUser(user: User): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      this.apiUrl,
      user,
      headerAuthorization()
    );
  }

  updatePassword(passwords: {
    currentPassword: string;
    password: string;
  }): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.apiUrl}/updatePassword`,
      passwords,
      headerAuthorization()
    );
  }

  getAllById(id_user: number): Observable<User> {
    return this.http.get<User>(
      `${environment.apiUrl}employees/${id_user}`,
      headerAuthorization()
    );
  }

  deleteUser(identification: string): Observable<GenericResponse> {
    return this.http.delete<GenericResponse>(
      `${this.apiUrl}/${identification}`,
      headerAuthorization()
    );
  }
}
