import { Observable } from "rxjs";
import { User } from "../Model/User.Model";

export abstract class GetByIdUserGateway {
    abstract getAllById(id_user: number): Observable<User>;
}


