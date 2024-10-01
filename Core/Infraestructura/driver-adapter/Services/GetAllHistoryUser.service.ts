import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'Core/Config/Enviroment';
import { HistoryUser } from 'Core/Domain/Model/HistoryUser.Model';
import { GetAllHistoryUserGateway } from 'Core/Domain/Gateway/GetAllHistoryUser.Gateway';

@Injectable({
  providedIn: 'root',
})
export class GetAllHistoryUserService implements GetAllHistoryUserGateway {
  private apiUrl = `${environment.apiUrl}history-users`;

  constructor(private http: HttpClient) {}

  getAllHistoryUsers(): Observable<HistoryUser[]> {
    return this.http.get<HistoryUser[]>(this.apiUrl);
  }
}
