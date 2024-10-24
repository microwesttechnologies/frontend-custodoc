import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../models/company.model';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from '../../models/global.model';

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
}
