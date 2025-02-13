import { Component, HostBinding, inject, Input } from '@angular/core';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { GlobalService } from 'src/app/services/external/global.service';
import { DocumentService } from 'src/app/services/external/document.service';
import { FormControl } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import {
  validateFormField,
  validateLimitText,
} from 'src/app/services/local/helper.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Document } from 'src/app/models/document.model';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { ModalBulkloadComponent } from './components/modal-bulkload/modal-bulkload.component';
import { environment } from 'src/environments/environment';
import { UserLocalService } from 'src/app/services/local/user.service';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import { ActivatedRoute } from '@angular/router';
import { ModalCreateAndUpdateDocumentComponent } from '../components/modal-create-and-update-document/modal-create-and-update-document.component';
import { ModalPreviewDocumentComponent } from '../components/modal-preview-document/modal-preview-document.component';
import { homologateText } from 'src/app/globals/homologate-text';

@Component({
  selector: 'app-history-module',
  standalone: true,
  imports: [
    ModalCreateAndUpdateDocumentComponent,
    ModalConfirmationDeleteComponent,
    ModalPreviewDocumentComponent,
    ModalBulkloadComponent,
    TooltipDirective,
    ButtonComponent,
    NavbarComponent,
    TableComponent,
    InputComponent,
    SharedModule,
  ],
  templateUrl: './history-module.component.html',
  styleUrl: './history-module.component.scss',
  providers: [],
})
export class HistoryModuleComponent {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  @Input() customers: Customer[] = [];

  public storageUrl = environment.storageUrl;

  public documents: Document[] = [];

  public rangeDatesControl = new FormControl();
  public documentToDelete?: Document;

  public searchControl = new FormControl();

  public fieldsToFilter = [
    'name_customer',
    'name',
    'identification',
    'description',
  ];

  private idHistoryByUrl?: number;
  public fileUrl?: string;

  public listStatus = {
    disabledPrimaryButton: false,
    showModalDocument: false,
    showModalBulkload: false,
    showModalPreview: false,
    uploadingFiles: false,
    savingDocument: false,
    loadingTable: true,
  };

  public withDeletePermission = false;

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly activatedRoute = inject(ActivatedRoute);
  public userLocalService = inject(UserLocalService);

  ngOnInit(): void {
    this.idHistoryByUrl =
      this.activatedRoute.snapshot.queryParams['id_history'];
    this.rangeDatesControl.markAsTouched();

    this.withDeletePermission = !!this.userLocalService?.menuSidebar?.find(
      (module) => module.code === 'DOCUMENT' && module.DELETE
    );

    this.getAllDocuments();
  }

  public getAllDocuments(): void {
    let rangeDates = this.rangeDatesControl?.value?.split(' to ');
    if (rangeDates?.length !== 2) rangeDates = '';

    this.listStatus.loadingTable = true;
    this.documentService.getAllDocuments(rangeDates).subscribe({
      next: (documents) => {
        this.listStatus.loadingTable = false;
        this.documents = documents;
        if (this.idHistoryByUrl) {
          this.previewFile(+this.idHistoryByUrl);
          this.idHistoryByUrl = undefined;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar las historias clínicas`,
          'danger',
          10000
        );
      },
    });
  }

  public openModalCreateDocument() {
    this.listStatus.disabledPrimaryButton = false;
    this.listStatus.showModalDocument = true;
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

  public modalBulkloadChange(action: 'close' | 'show' | 'refresh') {
    this.listStatus.showModalBulkload = !['close', 'refresh'].includes(action);
    if (action === 'refresh') {
      this.notificationService.showNotification(
        'Archivos cargados exitosamente',
        'success'
      );
      this.getAllDocuments();
    }
  }

  public exportTableToCsv(): void {
    const headers = `Nombre del ${homologateText(
      this.userLocalService?.user?.type_company!,
      'cliente'
    )},Nombre documento, Identificación cliente, Descripción`;
    const rows = this.documents
      .map((document) =>
        [
          document.name_customer,
          document.name,
          document.identification,
          document.description,
        ]
          .map(
            (value) =>
              typeof value === 'string' && value.includes('\n')
                ? `"${value.replace(/"/g, '""')}"` // Manejar saltos de línea y comillas dobles
                : `"${String(value).replace(/"/g, '""')}"` // Encerrar todos los valores entre comillas dobles
          )
          .join(',')
      )
      .join('\n');

    const csvData = `${headers}\n${rows}`;

    const bom = '\uFEFF'; // BOM para UTF-8
    const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date();

    const filename = `historias-clinicas-${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public deleteDocument() {
    this.documentService
      .deleteDocument(this.documentToDelete?.id_history!)
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.notificationService.showNotification(
              `Historia clínica eliminada exitosamente`,
              'success'
            );
            this.documents = this.documents.filter(
              (document) =>
                document.id_history !== this.documentToDelete?.id_history!
            );
            this.documentToDelete = undefined;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo eliminar la historia clínica`,
            'danger'
          );
        },
      });
  }
}
