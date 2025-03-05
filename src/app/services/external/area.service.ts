import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Company } from 'src/app/models/company.model';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';
import { Area } from 'src/app/models/area.model';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private readonly apiUrl = `${environment.apiUrl}areas`;

  constructor(private http: HttpClient) {}

  getAllAreas(id_company?: number): Observable<Area[]> {
    return this.http.get<Area[]>(
      `${this.apiUrl}${id_company ? '/' + id_company : ''}`,
      headerAuthorization()
    );
  }

  createArea(name: string): Observable<GenericResponse<Area>> {
    return this.http.post<GenericResponse<Area>>(
      this.apiUrl,
      { name },
      headerAuthorization()
    );
  }

  updateArea(body: {
    id_area: number;
    name: string;
  }): Observable<GenericResponse<Area>> {
    return this.http.put<GenericResponse<Area>>(
      this.apiUrl,
      body,
      headerAuthorization()
    );
  }
}
