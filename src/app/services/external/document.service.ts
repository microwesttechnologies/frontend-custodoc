import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';
import { Document } from 'src/app/models/documents.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}document`;

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, headerAuthorization());
  }

  createDocument(document: FormData): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      document,
      headerAuthorization()
    );
  }

  bulkUploadDocuments(documents: FormData): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${this.apiUrl}/bulkUploadDocuments`,
      documents,
      headerAuthorization()
    );
  }

  getFile(id_history: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/getFile/${id_history}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
      }),
      responseType: 'blob',
    });
  }

  getAllDocumentsByCustomer(id_customer: string): Observable<Document[]> {
    return this.http.get<Document[]>(
      `${this.apiUrl}/getAllDocumentsByCustomer/${id_customer}`,
      headerAuthorization()
    );
  }
}
