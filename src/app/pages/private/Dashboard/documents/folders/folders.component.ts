import {
  Component,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { ItemSkeletonComponent } from 'src/app/shared-components/item-skeleton/item-skeleton.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { DocumentService } from 'src/app/services/external/document.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { FolderService } from 'src/app/services/external/folder.service';
import { debounceTime, forkJoin } from 'rxjs';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import {
  createArrayByNumber,
  downloadFile,
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
import { ModalCreateAndUpdateDocumentComponent } from '../components/modal-create-and-update-document/modal-create-and-update-document.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import {
  HttpErrorResponse,
  HttpEventType,
  HttpParams,
} from '@angular/common/http';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { FormControl, Validators } from '@angular/forms';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { BreadcumbFoldersComponent } from '../components/breadcumb-folders/breadcumb-folders.component';
import { AreaService } from 'src/app/services/external/area.service';
import { Area } from 'src/app/models/area.model';
import { UserLocalService } from 'src/app/services/local/user.service';
import { SelectComponent } from 'src/app/shared-components/form/select/select.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { environment } from 'src/environments/environment';
import { CompanyService } from 'src/app/services/external/company.service';
import { Company } from 'src/app/models/company.model';
import { DragAndDropFileDirective } from 'src/app/directives/drag-and-drop-file.directive';
import { Router } from '@angular/router';

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
    DisabledByPermissionDirective,
    BreadcumbFoldersComponent,
    DisabledElementDirective,
    DragAndDropFileDirective,
    ItemSkeletonComponent,
    OverlayDirective,
    TooltipDirective,
    ButtonComponent,
    ModalComponent,
    SelectComponent,
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

  @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;

  @Input() customers: Customer[] = [];

  public storageUrl = environment.storageUrl;
  public filter?: 'isFavorite' | 'isViewed';
  public searchControl = new FormControl();
  public queryParams = new HttpParams();

  public levelFolders: LevelFolders[] = [{ id_folder: null, name: 'Inicio' }];
  public listDocuments: Document[] = [];
  public listFolders: FolderForm[] = [];
  public companies: Company[] = [];
  public areas: Area[] = [];

  public idAreaSelected!: number | null;
  public documentToUpdate?: Document;
  public documentToDelete?: Document;
  public folderToDelete?: FolderForm;

  public nameFolderControl = new FormControl<string>('', Validators.required);
  public idAreaControl = new FormControl<number | null>(
    null,
    Validators.required
  );
  public selectedAll = new FormControl<boolean>(false);

  public uploadProgress = signal<number>(0);
  public droppedFiles = signal<File[]>([]);

  public listStatus = {
    showModalMultipleDelete: false,
    finishedUploadFiles: false,
    showModalDocument: false,
    loadingDocuments: false,
    showModalDelete: false,
    showProgressBar: false,
    creatingFolder: false,
  };

  public createArrayByNumber = createArrayByNumber;
  public validateLimitText = validateLimitText;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly companyService = inject(CompanyService);
  private readonly folderService = inject(FolderService);
  public userLocalService = inject(UserLocalService);
  private readonly areaService = inject(AreaService);
  private readonly router = inject(Router);

  public get editingFolder(): boolean {
    return this.listFolders.some((folder) => folder.isEditing);
  }

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
    if (this.userLocalService?.companySelected?.id_company)
      this.queryParams = this.queryParams.set(
        'id_company',
        this.userLocalService?.companySelected?.id_company
      );

    this.getDocumentsAndFoldersByFolder();

    this.searchControl?.valueChanges
      ?.pipe(debounceTime(300))
      .subscribe(() => this.executeFilterBySearch());

    if (
      this.userLocalService.user?.id_area === 1 ||
      this.userLocalService?.user?.id_rol === 4
    )
      this.getAllAreas();
    else {
      this.idAreaSelected = this.userLocalService.user?.id_area!;
      this.idAreaControl.setValue(this.idAreaSelected);
    }
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
        this.listStatus.loadingDocuments = false;
      }
    );
  }

  private executeFilterBySearch(): void {
    this.queryParams = this.queryParams.set('search', this.searchControl.value);

    if (this.filter === 'isViewed') {
      this.levelFolders = this.levelFolders.slice(0, 1);
      this.listFolders = [];
    } else {
      this.getFoldersByParent();
    }

    this.getDocumentsByFolder();
  }

  public executeFilterFavoriteOrViewed(
    filter: 'isFavorite' | 'isViewed'
  ): void {
    this.selectedAll.setValue(false);
    this.listStatus.loadingDocuments = true;
    this.filter = this.filter === filter ? undefined : filter;
    this.queryParams = new HttpParams();
    if (this.filter) this.queryParams = this.queryParams.append(filter, true);

    if (this.filter === 'isViewed') {
      this.levelFolders = this.levelFolders.slice(0, 1);
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
          this.listStatus.loadingDocuments = false;
        },
      });
  }

  private getFoldersByParent() {
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
          this.listStatus.loadingDocuments = false;
        },
      });
  }

  private getAllAreas(): void {
    this.areaService
      .getAllAreas(this.userLocalService?.companySelected?.id_company)
      .subscribe({
        next: (areas) => (this.areas = areas),
      });
  }

  public getAllCompanies(): void {
    const params = new HttpParams().append('type_company', 'Otras');
    this.companyService.getAllCompanies(params).subscribe({
      next: (companies) => (this.companies = companies),
    });
  }

  public previewFile(document: Document, download: boolean = false) {
    if (download) {
      let params = new HttpParams()
        .append('id_history', document.id_history)
        .append('download', true);
      this.documentService.getFile(params).subscribe({
        next: (file) => downloadFile(document.name, file, 'pdf'),
        error: (err) => {
          console.error(err);
          this.notificationService.showNotification(
            'Lo sentimos, no se pudo descargar el archivo',
            'danger'
          );
        },
      });
    } else redirect(`preview-file/${document.id_history}`, true);
  }

  public previousAndNextFolder(
    folder?: LevelFolders,
    levelFolders?: LevelFolders[]
  ) {
    if (levelFolders) this.levelFolders = levelFolders;
    else if (folder) {
      this.levelFolders.push(folder);
      if (
        this.userLocalService.user.id_area === 1 ||
        this.userLocalService?.user?.id_rol === 4
      ) {
        this.idAreaSelected = folder?.id_area!;
        this.idAreaControl.setValue(this.idAreaSelected);
      }
    } else this.levelFolders.pop();

    if (
      this.levelFolders.length === 1 &&
      (this.userLocalService.user.id_area === 1 ||
        this.userLocalService?.user?.id_rol === 4)
    )
      this.idAreaSelected = null;

    this.cancelCreateOrUpdateFolder('create', this.nameFolderControl);

    this.searchControl.setValue('', { emitEvent: false });
    this.queryParams = this.queryParams.delete('search');
    this.selectedAll.setValue(false);
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
            this.listDocuments[index]!.isFavorite = this.listDocuments[index]!
              .isFavorite
              ? 0
              : 1;
          } else {
            this.listFolders[index]!.isFavorite = this.listFolders[index]!
              .isFavorite
              ? 0
              : 1;
          }
          if (this.filter === 'isFavorite') {
            this.listDocuments = [];
            this.listFolders = [];
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
            id_area: +this.idAreaControl?.value! || 1,
            parent: this.lastIdFolder,
            id_company: this.userLocalService?.companySelected?.id_company,
          })
        : this.folderService.updateFolder({
            id_folder: this.listFolders[index].id_folder!,
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
            this.selectAll(false);
          } else {
            this.listFolders[index].name = control.value;
            this.listFolders[index].isEditing = false;
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
      if (
        (this.userLocalService.user.id_area === 1 ||
          this.userLocalService?.user?.id_rol === 4) &&
        this.levelFolders.length === 1
      )
        this.idAreaControl.reset();
    } else if (index !== undefined) {
      this.listFolders[index].isEditing = false;
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
      .filter((document) => document.selected)
      .map((document) => document.id_history);
    const folders = this.listFolders
      .filter((folder) => folder.selected)
      .map((folder) => folder.id_folder as number);
    this.folderService
      .deleteFoldersAndDocumentsById(
        {
          documents,
          folders,
        },
        true
      )
      .subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.message!,
            response.status ? 'success' : 'danger'
          );

          if (response.status) {
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

  private goToSeeDocument(doc: Document): void {
    const link = document.createElement('a');
    link.href = this.storageUrl + doc.path;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public onFilesDropped(files: File[]) {
    this.droppedFiles.set(files);
    this.bulkUploadDocumentsOtherCompanies();
  }

  public onFileSelected(event: any) {
    if (event.target.files.length) {
      const files = Array.from(event.target.files).filter(
        (file: any) => file.type === 'application/pdf'
      ) as File[];

      if (files.length) {
        this.droppedFiles.set(files);
        this.bulkUploadDocumentsOtherCompanies();
      } else {
        this.notificationService.showNotification(
          'Solo se pueden cargar archivos de tipo PDF',
          'danger'
        );
      }
    }
  }

  private bulkUploadDocumentsOtherCompanies(): void {
    const formData = new FormData();

    formData.append('id_area', `${this.idAreaSelected ?? 1}`);
    formData.append('id_folder', `${this.lastIdFolder}`);
    formData.append(
      'id_company',
      `${this.userLocalService?.companySelected?.id_company}`
    );

    this.droppedFiles().forEach((file, index) => {
      formData.append(`documents[${index}][name]`, file.name);
      formData.append(`documents[${index}][file]`, file);
    });

    this.listStatus.showProgressBar = true;
    this.documentService.bulkUploadDocumentsOtherCompanies(formData).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          this.uploadProgress.set(percentDone);
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress.set(0);
          this.listStatus.finishedUploadFiles = true;
          this.inputFile.nativeElement.value = '';
          this.getDocumentsByFolder();

          setTimeout(() => {
            this.listStatus.finishedUploadFiles = false;
            this.listStatus.showProgressBar = false;
          }, 3000);
        }
      },
      (error: HttpErrorResponse) => {
        this.inputFile.nativeElement.value = '';
        this.listStatus.showProgressBar = false;
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error, comunicate con el administrador',
          'danger'
        );
      }
    );
  }
}
