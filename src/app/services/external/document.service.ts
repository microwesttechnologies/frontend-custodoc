import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';
import { Document } from 'src/app/models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}document`;

  constructor(private http: HttpClient) {}

  getAllDocuments(rangeDates: string): Observable<Document[]> {
    return this.http.get<Document[]>(
      `${this.apiUrl}${rangeDates ? '?rangeDates=' + rangeDates : ''}`,
      headerAuthorization()
    );
  }

  getDocumentsByFolder(
    id_folder: number | null,
    params?: HttpParams
  ): Observable<Document[]> {
    return this.http.get<Document[]>(
      `${this.apiUrl}/getDocumentsByFolder/${id_folder}`,
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        }),
        params,
      }
    );
  }

  createDocument(document: FormData): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      document,
      headerAuthorization()
    );
  }

  updateDocument(document: FormData): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
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

  getAllDocumentsByCustomer(
    id_customer: string,
    rangeDates: string
  ): Observable<Document[]> {
    return this.http.get<Document[]>(
      `${this.apiUrl}/getAllDocumentsByCustomer/${id_customer}${
        rangeDates ? '?rangeDates=' + rangeDates : ''
      }`,
      headerAuthorization()
    );
  }

  deleteDocument(
    id_history: number,
    temporal?: boolean
  ): Observable<GenericResponse> {
    return this.http.delete<GenericResponse>(
      `${this.apiUrl}/${id_history}${temporal ? '?temporal=true' : ''}`,
      headerAuthorization()
    );
  }

  markAndDesmarkFavorite(
    param: string,
    id: number
  ): Observable<GenericResponse> {
    return this.http.get<GenericResponse>(
      `${this.apiUrl}/markAndDesmarkFavorite?${param}=${id}`,
      headerAuthorization()
    );
  }

  restoreDocument(id_history: number): Observable<GenericResponse> {
    return this.http.get<GenericResponse>(
      `${this.apiUrl}/restoreDocument/${id_history}`,
      headerAuthorization()
    );
  }
}
