import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';
import { Document } from 'src/app/models/document.model';
import { Rol, RolPermissions } from 'src/app/models/rol.model';
import { RoutesAndPermissionsForm } from 'src/app/models/routes.model';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private readonly apiUrl = `${environment.apiUrl}roles`;

  constructor(private http: HttpClient) {}

  getRolesByCompany(id_company?: number): Observable<Rol[]> {
    return this.http.get<Rol[]>(
      `${this.apiUrl}/getRolesByCompany${id_company ? `/${id_company}` : ''}`,
      headerAuthorization()
    );
  }

  getRolesAndPermissions(): Observable<RolPermissions[]> {
    return this.http.get<RolPermissions[]>(
      `${this.apiUrl}/getRolesAndPermissions`,
      headerAuthorization()
    );
  }

  createRol(body: any): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${this.apiUrl}`,
      body,
      headerAuthorization()
    );
  }

  updateRol(body: any): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.apiUrl}`,
      body,
      headerAuthorization()
    );
  }
}
