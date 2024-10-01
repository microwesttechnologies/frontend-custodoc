import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'Core/Config/Enviroment';
import { Company } from 'Core/Domain/Model/Company.Model';
import { GetAllCompanyGateway } from 'Core/Domain/Gateway/GetAllCompany.Gateway';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompanyService implements GetAllCompanyGateway {
  private apiUrl = `${environment.apiUrl}companies`;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }
}
