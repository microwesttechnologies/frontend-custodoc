import { Observable } from "rxjs";
import { Employee } from "../Model/User.Model";

export abstract class CreateEmployeeGateway {
    abstract create(employeee: Employee): Observable<Object>;
}