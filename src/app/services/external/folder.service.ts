import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { headerAuthorization } from '../local/helper.service';
import { GenericResponse } from 'src/app/models/global.model';
import { Folder } from 'src/app/models/folder.model';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private readonly apiUrl = `${environment.apiUrl}folder`;

  constructor(private http: HttpClient) {}

  getFoldersByParent(
    parent: number | null,
    params?: HttpParams
  ): Observable<Folder[]> {
    return this.http.get<Folder[]>(
      `${this.apiUrl}/getFoldersByParent/${parent}`,
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        }),
        params,
      }
    );
  }

  createFolder(folder: {
    name: string;
    parent: number | null;
  }): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      this.apiUrl,
      folder,
      headerAuthorization()
    );
  }

  updateFolder(folder: {
    name: string;
    id_folder: number;
  }): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      this.apiUrl,
      folder,
      headerAuthorization()
    );
  }

  deleteFolder(
    id_folder: number,
    temporal?: boolean
  ): Observable<GenericResponse> {
    return this.http.delete<GenericResponse>(
      `${this.apiUrl}/${id_folder}${temporal ? '?temporal=true' : ''}`,
      headerAuthorization()
    );
  }

  restoreFolder(id_folder: number): Observable<GenericResponse> {
    return this.http.get<GenericResponse>(
      `${this.apiUrl}/restoreFolder/${id_folder}`,
      headerAuthorization()
    );
  }
}
