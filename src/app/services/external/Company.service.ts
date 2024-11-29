import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Company } from 'src/app/models/company.model';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly apiUrl = `${environment.apiUrl}company`;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl, headerAuthorization());
  }

  createCompany(company: Company): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      company,
      headerAuthorization()
    );
  }

  updateCompany(company: Company): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      this.apiUrl,
      company,
      headerAuthorization()
    );
  }
}
