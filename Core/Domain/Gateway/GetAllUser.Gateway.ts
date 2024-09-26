import { Observable } from "rxjs";
import { User } from "../Model/User.Model";

export abstract class GetAllUserGateway {
    abstract getAllUsers(): Observable<Array<User>>;
}