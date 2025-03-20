import { Component, HostBinding, inject, Input, OnInit } from '@angular/core';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { ItemSkeletonComponent } from 'src/app/shared-components/item-skeleton/item-skeleton.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { DocumentService } from 'src/app/services/external/document.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { FolderService } from 'src/app/services/external/folder.service';
import { debounceTime, forkJoin } from 'rxjs';
import {
  createArrayByNumber,
  redirect,
  validateLimitText,
} from 'src/app/services/local/helper.service';
import { Folder, LevelFolders } from 'src/app/models/folder.model';
import { Document } from 'src/app/models/document.model';
import { OverlayDirective } from 'src/app/directives/overlay.directive';
import {
  fadeInCustomAnimation,
  slideCustomAnimation,
} from 'src/app/animations/global.animations';
import { Customer } from 'src/app/models/customer.model';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { ModalPreviewDocumentComponent } from '../components/modal-preview-document/modal-preview-document.component';
import { BreadcumbFoldersComponent } from '../components/breadcumb-folders/breadcumb-folders.component';
import { FormControl } from '@angular/forms';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [
    ModalConfirmationDeleteComponent,
    ModalPreviewDocumentComponent,
    DisabledByPermissionDirective,
    BreadcumbFoldersComponent,
    ItemSkeletonComponent,
    OverlayDirective,
    TooltipDirective,
    NavbarComponent,
    ModalComponent,
    SharedModule,
  ],
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.scss',
  animations: [
    slideCustomAnimation('slideEnterRight', 'X', '1rem', '0', {
      enter: '300ms',
    }),
    slideCustomAnimation('slideLeaveLeft', 'X', '-1rem', '0', {
      leave: '300ms',
    }),
    fadeInCustomAnimation('fadeInOut', '300ms', '300ms'),
    fadeInCustomAnimation('fadeIn', '300ms'),
  ],
})
export class TrashComponent implements OnInit {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  @Input() customers: Customer[] = [];

  public searchControl = new FormControl();

  public levelFolders: LevelFolders[] = [{ id_folder: null, name: 'Inicio' }];
  public listDocuments: Document[] = [];
  public listFolders: Folder[] = [];

  public documentToDelete?: Document;
  public folderToDelete?: Folder;

  public selectedAll = new FormControl<boolean>(false);

  public listStatus = {
    showModalMultipleDelete: false,
    showModalDocument: false,
    loadingDocuments: false,
    showModalPreview: false,
    creatingFolder: false,
    showModalDelete: false,
  };

  private queryParams = new HttpParams().append('deleted', true);

  public createArrayByNumber = createArrayByNumber;
  public validateLimitText = validateLimitText;

  private notificationService = inject(NotificationService);
  private documentService = inject(DocumentService);
  private folderService = inject(FolderService);

  public get lastIdFolder(): number | null {
    return this.levelFolders[this.levelFolders.length - 1]?.id_folder;
  }

  public get withSelecteds(): boolean {
    return (
      this.listDocuments.some((document) => document.selected) ||
      this.listFolders.some((folder) => folder.selected)
    );
  }

  ngOnInit(): void {
    this.getDocumentsAndFoldersByFolder();

    this.searchControl?.valueChanges
      ?.pipe(debounceTime(300))
      .subscribe(() => this.executeFilterBySearch());
  }

  private getDocumentsAndFoldersByFolder(): void {
    const $getDocumentsByFolder = this.documentService.getDocumentsByFolder(
      this.lastIdFolder,
      this.queryParams
    );
    const $getFoldersByParent = this.folderService.getFoldersByParent(
      this.lastIdFolder,
      this.queryParams
    );

    this.listStatus.loadingDocuments = true;

    forkJoin([$getDocumentsByFolder, $getFoldersByParent]).subscribe(
      ([documents, folders]) => {
        this.listDocuments = documents;
        this.listFolders = folders;

        this.listStatus.loadingDocuments = false;
      }
    );
  }

  private executeFilterBySearch(): void {
    this.queryParams = this.queryParams.set('search', this.searchControl.value);
    this.getFoldersByParent();
    this.getDocumentsByFolder();
  }

  public getDocumentsByFolder() {
    this.documentService
      .getDocumentsByFolder(this.lastIdFolder, this.queryParams)
      .subscribe({
        next: (documents) => (this.listDocuments = documents),
      });
  }

  public getFoldersByParent() {
    this.folderService
      .getFoldersByParent(this.lastIdFolder, this.queryParams)
      .subscribe({
        next: (folders) => (this.listFolders = folders),
      });
  }

  public previewFile(id_history: number) {
    redirect(`preview-file/${id_history}`, true);
  }

  public previousAndNextFolder(
    folder?: LevelFolders,
    levelFolders?: LevelFolders[]
  ) {
    if (levelFolders) this.levelFolders = levelFolders;
    else if (folder) this.levelFolders.push(folder);
    else this.levelFolders.pop();

    this.listDocuments = [];
    this.listFolders = [];
    this.getDocumentsAndFoldersByFolder();
  }

  public restoreDocument(id_history: number) {
    this.documentService.restoreDocument(id_history!).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            response.message!,
            'success'
          );
          this.listDocuments = this.listDocuments.filter(
            (document) => document.id_history !== id_history
          );
        } else {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo restaurar el documento`,
            'danger'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo restaurar el documento`,
          'danger'
        );
      },
    });
  }

  public deleteDocument(action: boolean) {
    if (action) {
      this.documentService
        .deleteDocument(this.documentToDelete?.id_history!)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.notificationService.showNotification(
                `Documento eliminado exitosamente`,
                'success'
              );
              this.listDocuments = this.listDocuments.filter(
                (document) =>
                  document.id_history !== this.documentToDelete?.id_history
              );
              this.documentToDelete = undefined;
            } else {
              this.notificationService.showNotification(
                `Lo sentimos, no se pudo eliminar el documento`,
                'danger'
              );
            }
          },
          error: (error: HttpErrorResponse) => {
            this.notificationService.showNotification(
              `Lo sentimos, no se pudo eliminar el documento`,
              'danger'
            );
          },
        });
    } else {
      this.documentToDelete = undefined;
    }
  }

  public restoreFolder(id_folder: number) {
    this.folderService.restoreFolder(id_folder!).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            response.message!,
            'success'
          );
          this.listFolders = this.listFolders.filter(
            (folder) => folder.id_folder !== id_folder
          );
        } else {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo restaurar la carpeta`,
            'danger'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo restaurar la carpeta`,
          'danger'
        );
      },
    });
  }

  public deleteFolder(action: boolean) {
    if (action) {
      this.folderService
        .deleteFolder(this.folderToDelete?.id_folder!)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.notificationService.showNotification(
                `Carpeta eliminada exitosamente`,
                'success'
              );
              this.listFolders = this.listFolders.filter(
                (folder) => folder.id_folder !== this.folderToDelete?.id_folder
              );
              this.folderToDelete = undefined;
            } else {
              this.notificationService.showNotification(
                `Lo sentimos, no se pudo eliminar la carpeta`,
                'danger'
              );
            }
          },
          error: (error: HttpErrorResponse) => {
            this.notificationService.showNotification(
              `Lo sentimos, no se pudo eliminar la carpeta`,
              'danger'
            );
          },
        });
    } else {
      this.folderToDelete = undefined;
    }
  }

  public selectAll(status: boolean): void {
    this.selectedAll.setValue(status);

    this.listDocuments.forEach((document) => (document.selected = status));
    this.listFolders.forEach((folder) => (folder.selected = status));
  }

  public selectDocumentOrFolder(documentOrFolder: any): void {
    documentOrFolder.selected = !documentOrFolder?.selected;

    const allDocumentsSelected = this.listDocuments.every(
      (document) => document.selected
    );
    const allFoldersSelected = this.listFolders.every(
      (folder) => folder.selected
    );

    this.selectedAll.setValue(allDocumentsSelected && allFoldersSelected);
  }

  public deleteFoldersAndDocumentsById(): void {
    const documents = this.listDocuments
      .filter((document) => document.selected && document.deleted_at)
      .map((document) => document.id_history);

    const folders = this.listFolders
      .filter((folder) => folder.selected && folder.deleted_at)
      .map((folder) => folder.id_folder as number);

    this.folderService
      .deleteFoldersAndDocumentsById({
        documents,
        folders,
      })
      .subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.message!,
            response.status ? 'success' : 'danger'
          );

          if (response.status) {
            this.listDocuments = [];
            this.listFolders = [];
            this.getDocumentsAndFoldersByFolder();
            this.listStatus.showModalMultipleDelete = false;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo eliminar los documentos y carpetas seleccionadas`,
            'danger'
          );
        },
      });
  }
}
