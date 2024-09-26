import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../Model/Company.Model';
import { GetAllCompanyGateway } from '../Gateway/GetAllCompany.Gateway';


@Injectable({
  providedIn: 'root',
})
export class GetAllCompanyUseCases {
  constructor(private _companyGateway: GetAllCompanyGateway) {}

  getAllCompanies(): Observable<Array<Company>> {
    return this._companyGateway.getAll();
  }
}
