import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { headerAuthorization } from '../local/helper.service';
import { Customer } from '../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly apiUrl = `${environment.apiUrl}customers`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl, headerAuthorization());
  }

  createCustomer(customer: Customer): Observable<Customer[]> {
    return this.http.post<Customer[]>(
      this.apiUrl,
      customer,
      headerAuthorization()
    );
  }
}
