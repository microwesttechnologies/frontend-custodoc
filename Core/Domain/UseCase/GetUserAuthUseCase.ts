import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { GetAllUsersService } from "Core/Infraestructura/driver-adapter/Services/GetAllUser.service";

@Injectable({
    providedIn: 'root'
})
export class GetUserAuthUseCase {
    constructor(private _getAllUsersService: GetAllUsersService) {}

    login(email: string, password: string): Observable<boolean> {
        return this._getAllUsersService.getAllUsers()
            .pipe(
                map(users => {
                    const user = users.find(u => u.emailUser === email && u.passUser === password);
                    return !!user;
                })
            );
    }
}
