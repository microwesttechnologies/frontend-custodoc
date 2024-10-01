import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { GetAllUsersService } from "Core/Infraestructura/driver-adapter/Services/GetAllUser.service";

@Injectable({
    providedIn: 'root'
})
export class GetUserAuthUseCase {
    constructor(private _getAllUsersService: GetAllUsersService) {}

    login(email: string, password: string): Observable<{ isAuthenticated: boolean, role: string, name: string }> {
        return this._getAllUsersService.getAllUsers()
          .pipe(
            map(users => {
              const user = users.find(u => u.emailUser === email && u.passUser === password);
              if (user) {
                return { isAuthenticated: true, role: user.role, name: user.nameUser };
              } else {
                return { isAuthenticated: false, role: '', name: '' };
              }
            })
          );
      }
}
