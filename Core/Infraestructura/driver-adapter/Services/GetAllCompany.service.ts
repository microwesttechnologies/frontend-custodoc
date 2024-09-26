import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'Core/Config/Enviroment';
import { GetAllCompanyGateway } from 'Core/Domain/Gateway/GetAllCompany.Gateway';
import { Company } from 'Core/Domain/Model/Company.Model';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompanyService extends GetAllCompanyGateway {
  constructor(private http: HttpClient) {
    super();
  }

  override getAll(): Observable<Company[]> {
    return this.http.get<Array<Company>>(environment.apiUrl+'companies');
  }

}
