import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'Core/Config/Enviroment';
import { UploadDocumentGateway } from 'Core/Domain/Gateway/UploadDocument.Gateway';
import { UploadDocumentResponse } from 'Core/Domain/Model/UploadDocument.Model';

@Injectable({
  providedIn: 'root',
})
export class UploadDocumentService extends UploadDocumentGateway {
  constructor(private http: HttpClient) {
    super();
  }

  override uploadDocument(formData: FormData): Observable<UploadDocumentResponse> { 
    return this.http.post<UploadDocumentResponse>(`${environment.apiUrl}upload-documents`, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    });
  }
}