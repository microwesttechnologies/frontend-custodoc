import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DetailCompany } from 'src/app/models/global.model';
import { headerAuthorization } from '../local/helper.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private readonly apiUrl = `${environment.apiUrl}`;
  public detailCompany!: DetailCompany;

  constructor(private http: HttpClient) {}

  getDetailCompany(): Observable<DetailCompany> {
    return this.http.get<DetailCompany>(
      `${environment.apiUrl}getDetailCompany`,
      headerAuthorization()
    );
  }
}
