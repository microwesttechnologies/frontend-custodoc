import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { headerAuthorization } from '../local/helper.service';
import { Customer } from 'src/app/models/customer.model';
import { GenericResponse } from 'src/app/models/global.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}customer`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl, headerAuthorization());
  }

  createCustomer(customer: Customer): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      customer,
      headerAuthorization()
    );
  }
}
