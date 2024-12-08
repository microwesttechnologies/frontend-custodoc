import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { GlobalService } from 'src/app/services/external/global.service';
import { DocumentService } from 'src/app/services/external/document.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CustomerService } from 'src/app/services/external/customer.service';
import { Customer } from 'src/app/models/customer.model';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { AutoCompleteComponent } from 'src/app/shared-components/form/autocomplete/autocomplete.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import {
  validateFormField,
  validateLimitText,
} from 'src/app/services/local/helper.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Document } from 'src/app/models/documents.model';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';
import { ModalBulkloadComponent } from './components/modal-bulkload/modal-bulkload.component';
import { environment } from 'src/environments/environment';
import { UserLocalService } from 'src/app/services/local/user.service';
import { homologateText } from 'src/app/globals/homologate-text';

@Component({
  selector: 'app-history-module',
  standalone: true,
  imports: [
    ModalBulkloadComponent,
    AutoCompleteComponent,
    TooltipDirective,
    NavbarComponent,
    ModalComponent,
    TableComponent,
    InputComponent,
    SharedModule,
    SafeUrlPipe,
  ],
  templateUrl: './history-module.component.html',
  styleUrl: './history-module.component.scss',
  providers: [],
})
export class HistoryModuleComponent {

  public storageUrl = environment.storageUrl;

  public documents: Document[] = [];
  public customers: Customer[] = [];

  public documentForm!: FormGroup;

  public nameFilter = '';

  public pdfSrc?: SafeResourceUrl;
  public selectedFilePdf?: File;
  public fileUrl?: string;

  public listStatus = {
    disabledPrimaryButton: false,
    showModalPrewiew: false,
    showModalBulkload: false,
    uploadingFiles: false,
    savingDocument: false,
    loadingTable: true,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;
  public homologateText = homologateText;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly customerService = inject(CustomerService);
  private readonly globalService = inject(GlobalService);
  private readonly formBuilder = inject(FormBuilder);
  public userLocalService = inject(UserLocalService);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.initForm();

    this.getAllCustomers();
    this.getAllDocuments();
  }

  private initForm(): void {
    this.documentForm = this.formBuilder.group({
      id_history: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      identification: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
  }

  private getAllCustomers(): void {
    this.listStatus.loadingTable = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.listStatus.loadingTable = false;
        this.customers = customers;
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar los ${homologateText(this.userLocalService?.user?.type_company!, 'clientes')}`,
          'danger',
          10000
        );
      },
    });
  }

  private getAllDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar los ${homologateText(this.userLocalService?.user?.type_company!, 'documentos')}`,
          'danger',
          10000
        );
      },
    });
  }

  public openModalCreateDocument() {
    this.listStatus.disabledPrimaryButton = false;
    this.listStatus.showModal = true;
    this.documentForm.reset();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFilePdf = file;

      if (file.type === 'application/pdf') {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`
        );
      } else {
        this.notificationService.showNotification(
          `Solo se permiten archivos PDF`,
          'danger'
        );
      }
    } else {
      this.selectedFilePdf = undefined;
      this.pdfSrc = undefined;
    }
  }

  public createDocument(): void {
    this.documentForm.markAllAsTouched();
    if (this.documentForm.valid) {
      const formData = new FormData();

      Object.entries(this.documentForm.value).forEach((elm: any[]) => {
        formData.append(elm[0], elm[1] ?? '');
      });
      formData.append('file', this.selectedFilePdf!);

      this.documentService.createDocument(formData).subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllDocuments();
            this.notificationService.showNotification(
              `${homologateText(this.userLocalService?.user?.type_company!, 'documento')} se agrego exitosamente`,
              'success'
            );
            this.listStatus.showModal = false;
            this.selectedFilePdf = undefined;
            this.globalService.detailCompany.documents.amount =
              this.globalService.detailCompany.documents.amount + 1;
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.savingDocument = false;
        },
        error: (error) => {
          this.listStatus.savingDocument = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo crear ${homologateText(this.userLocalService?.user?.type_company!, 'documento')}`,
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
    this.selectedFilePdf = undefined;
    this.pdfSrc = undefined;
  }

  public previewFile(document: Document) {
    this.documentService.getFile(document.id_history).subscribe({
      next: (file) => {
        this.listStatus.showModalPrewiew = true;
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
    const headers = 'Nombre del cliente,Nombre documento, Identificación cliente, Descripción';
    const rows = this.documents.map(document => [document.name_customer, document.name, document.identification, document.description].map((value) =>
      typeof value === 'string' && value.includes('\n')
        ? `"${value.replace(/"/g, '""')}"` // Manejar saltos de línea y comillas dobles
        : `"${String(value).replace(/"/g, '""')}"` // Encerrar todos los valores entre comillas dobles
    ).join(',')).join('\n');

    const csvData = `${headers}\n${rows}`;

    const bom = '\uFEFF'; // BOM para UTF-8
    const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date();

    const filename = `${homologateText(this.userLocalService?.user?.type_company!, 'documentos')}-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.csv`

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public deleteDocument(id_history: number) {
    this.documentService.deleteDocument(id_history).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(`${homologateText(this.userLocalService?.user?.type_company!, 'documento')} eliminado exitosamente`, 'success');
          this.documents = this.documents.filter(document=>document.id_history !== id_history);
          this.globalService.detailCompany.documents.amount = this.documents.length;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(`Lo sentimos, no se pudo eliminar ${homologateText(this.userLocalService?.user?.type_company!, 'documento')}`, 'danger');
      }
    })
  }
}
