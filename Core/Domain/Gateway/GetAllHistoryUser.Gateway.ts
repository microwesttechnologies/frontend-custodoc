import { Observable } from 'rxjs';
import { HistoryUser } from '../Model/HistoryUser.Model';

export abstract class GetAllHistoryUserGateway {
    abstract getAllHistoryUsers(): Observable<Array<HistoryUser>>;
}
