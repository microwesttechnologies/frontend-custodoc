import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'Core/Config/Enviroment';
import { GetByIdUserGateway } from 'Core/Domain/Gateway/GetByIdUser.Gateway';
import { User } from 'Core/Domain/Model/User.Model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetByIdUserService extends GetByIdUserGateway {
  constructor(private http: HttpClient) {
    super();
  }

  override getAllById(id_user: number): Observable<User> {

    return this.http.get<User>(`${environment.apiUrl}employees/${id_user}`);

  }
}
