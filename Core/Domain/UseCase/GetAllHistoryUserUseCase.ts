import { Injectable } from '@angular/core';
import { GetAllHistoryUserService } from 'Core/Infraestructura/driver-adapter/Services/GetAllHistoryUser.service';
import { Observable } from 'rxjs';
import { HistoryUser } from '../Model/HistoryUser.Model';

@Injectable({
  providedIn: 'root',
})
export class GetAllHistoryUserUseCase {
  constructor(private _historyUserGateway: GetAllHistoryUserService) {}

  getAllHistoryUsers(): Observable<HistoryUser[]> {
    return this._historyUserGateway.getAllHistoryUsers();
  }
}
