import { Injectable } from '@angular/core';
import { GetAllCompanyService } from 'Core/Infraestructura/driver-adapter/Services/GetAllCompany.service';
import { Observable } from 'rxjs';
import { Company } from '../Model/Company.Model';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompanyUseCase {
  constructor(private _companyGateway: GetAllCompanyService) { }

  getAllCompanies(): Observable<Company[]> {
    return this._companyGateway.getAllCompanies();
  }
}
