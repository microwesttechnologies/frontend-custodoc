import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { Routes } from 'src/app/models/routes.model';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private readonly apiUrl = `${environment.apiUrl}routes`;

  constructor(private http: HttpClient) {}

  getRoutesAndPermissions(): Observable<Routes[]> {
    return this.http.get<Routes[]>(
      `${this.apiUrl}/getRoutesAndPermissions`,
      headerAuthorization()
    );
  }

  getRoutesByRole(): Observable<Routes[]> {
    return this.http.get<Routes[]>(
      `${this.apiUrl}/getRoutesByRole`,
      headerAuthorization()
    );
  }
}
