import { Component, inject, Input } from '@angular/core';
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

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly customerService = inject(CustomerService);
  private readonly globalService = inject(GlobalService);
  private readonly formBuilder = inject(FormBuilder);
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
          'Lo sentimos, ha ocurrido un error al consultar los clientes',
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
          'Lo sentimos, ha ocurrido un error al consultar los documentos',
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
        formData.append(elm[0], elm[1]);
      });
      formData.append('file', this.selectedFilePdf!);

      this.documentService.createDocument(formData).subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllDocuments();
            this.notificationService.showNotification(
              'Compañía agregada exitosamente',
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
            'Lo sentimos, no se pudo crear el documento',
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
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
}
