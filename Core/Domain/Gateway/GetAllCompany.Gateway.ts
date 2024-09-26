import { Observable } from "rxjs";
import { Company } from "../Model/Company.Model";

export abstract class GetAllCompanyGateway {
    abstract getAll(): Observable<Array<Company>>;
}
