import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { TypesDocument } from '../../models/types-document.model';

@Injectable({
  providedIn: 'root',
})
export class TypesDocumentService {
  private readonly apiUrl = `${environment.apiUrl}types_document`;

  constructor(private http: HttpClient) {}

  getAllTypesDocument(): Observable<TypesDocument[]> {
    return this.http.get<TypesDocument[]>(this.apiUrl, headerAuthorization());
  }
}
