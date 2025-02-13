import { Component, HostBinding, inject, Input, OnInit } from '@angular/core';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { ItemSkeletonComponent } from 'src/app/shared-components/item-skeleton/item-skeleton.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { DocumentService } from 'src/app/services/external/document.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { FolderService } from 'src/app/services/external/folder.service';
import { debounceTime, forkJoin } from 'rxjs';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import {
  arrayFilter,
  createArrayByNumber,
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
import { ModalCreateAndUpdateDocumentComponent } from '../components/modal-create-and-update-document/modal-create-and-update-document.component';
import { ModalPreviewDocumentComponent } from '../components/modal-preview-document/modal-preview-document.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { FormControl, Validators } from '@angular/forms';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { BreadcumbFoldersComponent } from '../components/breadcumb-folders/breadcumb-folders.component';
import { ActivatedRoute } from '@angular/router';

interface FolderForm extends Folder {
  nameControl: FormControl;
  isEditing?: boolean;
}

@Component({
  selector: 'app-folders',
  standalone: true,
  imports: [
    ModalCreateAndUpdateDocumentComponent,
    ModalConfirmationDeleteComponent,
    ModalPreviewDocumentComponent,
    DisabledByPermissionDirective,
    BreadcumbFoldersComponent,
    DisabledElementDirective,
    ItemSkeletonComponent,
    OverlayDirective,
    TooltipDirective,
    ButtonComponent,
    NavbarComponent,
    InputComponent,
    SharedModule,
  ],
  templateUrl: './folders.component.html',
  styleUrl: './folders.component.scss',
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
export class FoldersComponent implements OnInit {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  @Input() customers: Customer[] = [];

  public filter?: 'isFavorite' | 'isViewed';
  public searchControl = new FormControl();
  private queryParams = new HttpParams();

  public levelFolders: LevelFolders[] = [{ id_folder: null, name: 'Inicio' }];
  public listDocuments: Document[] = [];
  public listFolders: FolderForm[] = [];

  public listDocumentsFiltered: Document[] = [];
  public listFoldersFiltered: FolderForm[] = [];

  public documentToUpdate?: Document;
  public documentToDelete?: Document;
  public folderToDelete?: FolderForm;

  public nameFolderControl = new FormControl<string>('', Validators.required);

  private idHistoryByUrl?: number;
  public fileUrl?: string;

  public listStatus = {
    showModalDocument: false,
    loadingDocuments: false,
    showModalPreview: false,
    showModalDelete: false,
    creatingFolder: false,
  };

  public createArrayByNumber = createArrayByNumber;
  public validateLimitText = validateLimitText;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly folderService = inject(FolderService);

  public get editingFolder(): boolean {
    return this.listFolders.some((folder) => folder.isEditing);
  }

  public get lastIdFolder(): number | null {
    return this.levelFolders[this.levelFolders.length - 1]?.id_folder;
  }

  ngOnInit(): void {
    this.idHistoryByUrl =
      this.activatedRoute.snapshot.queryParams['id_history'];
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
        this.listFolders = folders.map((folder) => {
          (folder as FolderForm).nameControl = new FormControl(
            folder.name,
            Validators.required
          );
          return folder as FolderForm;
        });
        this.executeFilterBySearch();
        this.listStatus.loadingDocuments = false;

        if (this.idHistoryByUrl) {
          this.previewFile(+this.idHistoryByUrl);
          this.idHistoryByUrl = undefined;
        }
      }
    );
  }

  private executeFilterBySearch(
    filter: 'documents' | 'folders' | 'both' = 'both'
  ): void {
    if (['both', 'documents'].includes(filter)) {
      this.listDocumentsFiltered = arrayFilter(
        this.listDocuments,
        this.searchControl.value,
        ['name', 'name_customer', 'identification']
      );
    }
    if (['both', 'folders'].includes(filter)) {
      this.listFoldersFiltered = arrayFilter(
        this.listFolders,
        this.searchControl.value,
        ['name', 'name_customer', 'identification']
      );
    }
  }

  public executeFilterFavoriteOrViewed(
    filter: 'isFavorite' | 'isViewed'
  ): void {
    this.listStatus.loadingDocuments = true;
    this.filter = this.filter === filter ? undefined : filter;
    this.queryParams = new HttpParams();
    if (this.filter) this.queryParams = this.queryParams.append(filter, true);

    if (this.filter === 'isViewed') {
      this.levelFolders = this.levelFolders.slice(0, 1);
      this.listFoldersFiltered = [];
      this.listFolders = [];
    } else {
      this.getFoldersByParent();
    }

    this.getDocumentsByFolder();
  }

  public getDocumentsByFolder() {
    this.documentService
      .getDocumentsByFolder(this.lastIdFolder, this.queryParams)
      .subscribe({
        next: (documents) => {
          this.listDocuments = documents;
          this.executeFilterBySearch('documents');
          this.listStatus.loadingDocuments = false;
        },
      });
  }

  public getFoldersByParent() {
    this.folderService
      .getFoldersByParent(this.lastIdFolder, this.queryParams)
      .subscribe({
        next: (folders) => {
          this.listFolders = folders.map((folder) => {
            (folder as FolderForm).nameControl = new FormControl(
              folder.name,
              Validators.required
            );
            return folder as FolderForm;
          });
          this.executeFilterBySearch('folders');
          this.listStatus.loadingDocuments = false;
        },
      });
  }

  public previewFile(id_history: number) {
    this.documentService.getFile(id_history).subscribe({
      next: (file) => {
        this.listStatus.showModalPreview = true;
        this.fileUrl = `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showNotification(
          'Lo sentimos, no se pudo mostrar el archivo',
          'danger'
        );
      },
    });
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

  public deleteDocument(action: boolean) {
    if (action) {
      this.documentService
        .deleteDocument(this.documentToDelete?.id_history!, true)
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
              this.executeFilterBySearch('documents');
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

  public markAndDesmarkFavorite(
    id: number,
    param: 'id_history' | 'id_folder',
    index: number
  ) {
    this.documentService.markAndDesmarkFavorite(param, id).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            response.message!,
            'success'
          );

          if (param === 'id_history') {
            this.listDocumentsFiltered[index]!.isFavorite = this
              .listDocumentsFiltered[index]!.isFavorite
              ? 0
              : 1;
          } else {
            this.listFoldersFiltered[index]!.isFavorite = this
              .listFoldersFiltered[index]!.isFavorite
              ? 0
              : 1;
          }
          if (this.filter === 'isFavorite') {
            this.listDocumentsFiltered = [];
            this.listFoldersFiltered = [];
            this.getDocumentsAndFoldersByFolder();
          }
        } else {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo actualizar ${
              param === 'id_history' ? 'el documento' : 'la carpeta'
            }`,
            'danger'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo actualizar ${
            param === 'id_history' ? 'el documento' : 'la carpeta'
          }`,
          'danger'
        );
      },
    });
  }

  public createOrUpdateFolder(
    type: 'create' | 'update',
    control: FormControl,
    index: number
  ): void {
    const endpointToExecute =
      type === 'create'
        ? this.folderService.createFolder({
            name: control.value,
            parent: this.lastIdFolder,
          })
        : this.folderService.updateFolder({
            id_folder: this.listFoldersFiltered[index].id_folder!,
            name: control.value,
          });

    endpointToExecute.subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            response.message!,
            'success'
          );
          if (type === 'create') {
            this.getFoldersByParent();
            this.cancelCreateOrUpdateFolder(type, control, index);
          } else {
            this.listFoldersFiltered[index].name = control.value;
            this.listFoldersFiltered[index].isEditing = false;
          }
        } else {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              type === 'create' ? 'crear' : 'actualizar'
            } la carpeta`,
            'danger'
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo ${
            type === 'create' ? 'crear' : 'actualizar'
          } la carpeta`,
          'danger'
        );
      },
    });
  }

  public deleteFolder(action: boolean) {
    if (action) {
      this.folderService
        .deleteFolder(this.folderToDelete?.id_folder!, true)
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
              this.executeFilterBySearch('folders');
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

  public cancelCreateOrUpdateFolder(
    type: 'create' | 'update',
    control: FormControl,
    index?: number
  ): void {
    if (type === 'create') {
      this.listStatus.creatingFolder = false;
      control.reset();
    } else if (index !== undefined) {
      this.listFoldersFiltered[index].isEditing = false;
      control.reset(this.listFolders[index].name);
    }
  }

  public setUpdateDocumentOrFolder(
    param: 'id_history' | 'id_folder',
    documentOrFolder: any
  ): void {
    if (param === 'id_folder') {
      (documentOrFolder as FolderForm).nameControl.markAsTouched();
      (documentOrFolder as FolderForm).isEditing = true;
    } else {
      this.listStatus.showModalDocument = true;
      this.documentToUpdate = documentOrFolder as Document;
    }
  }
}
