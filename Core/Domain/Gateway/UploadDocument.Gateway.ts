import { Observable } from 'rxjs';

export abstract class UploadDocumentGateway {
    abstract uploadDocument(formData: FormData): Observable<any>;
}
