import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadDocumentGateway } from '../Gateway/UploadDocument.Gateway';
import { UploadDocumentResponse } from '../Model/UploadDocument.Model';

@Injectable({
  providedIn: 'root',
})
export class UploadDocumentUseCase {
  constructor(private uploadDocumentGateway: UploadDocumentGateway) {}

  uploadDocument(file: File): Observable<UploadDocumentResponse> { 
    return this.uploadDocumentGateway.uploadDocument(file);
  }
}
