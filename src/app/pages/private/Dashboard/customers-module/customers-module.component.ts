import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { TypesDocumentService } from 'src/app/services/external/types-document.service';
import { CompanyService } from 'src/app/services/external/company.service';
import { UserLocalService } from 'src/app/services/local/user.service';
import { CustomerService } from 'src/app/services/external/customer.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { Company } from 'src/app/models/company.model';
import { TypesDocument } from 'src/app/models/types-document.model';
import { GlobalService } from 'src/app/services/external/global.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import {
  validateFormField,
  validateLimitText,
} from 'src/app/services/local/helper.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { SelectComponent } from 'src/app/shared-components/form/select/select.component';
import { AutoCompleteComponent } from 'src/app/shared-components/form/autocomplete/autocomplete.component';
import { DocumentService } from 'src/app/services/external/document.service';
import { Document } from 'src/app/models/documents.model';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';

@Component({
  selector: 'app-customers-module',
  standalone: true,
  imports: [
    DisabledElementDirective,
    AutoCompleteComponent,
    TooltipDirective,
    SelectComponent,
    NavbarComponent,
    InputComponent,
    TableComponent,
    ModalComponent,
    SharedModule,
  ],
  templateUrl: './customers-module.component.html',
  styleUrl: './customers-module.component.scss',
})
export class CustomersModuleComponent {
  public documentsByCustomer: Document[] = [];
  public typesDocument: TypesDocument[] = [];
  public customers: Customer[] = [];
  public companies: Company[] = [];

  public idCustomerSelected?: string;
  public customerForm!: FormGroup;

  public gridHeaderColumns =
    '10rem 10rem minmax(10rem, 1fr) minmax(10rem, 1fr) 10rem';
  public nameFilter = '';

  public listStatus = {
    loadingTableDocumentsByCustomer: true,
    savingCustomer: false,
    loadingTable: true,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;

  private readonly typesDocumentService = inject(TypesDocumentService);
  private readonly notificationService = inject(NotificationService);
  private readonly customerService = inject(CustomerService);
  private readonly documentService = inject(DocumentService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);
  private readonly formBuilder = inject(FormBuilder);
  public userLocalService = inject(UserLocalService);

  ngOnInit(): void {
    this.initForm();

    this.getAllTypesDocument();
    this.getAllCustomers();

    if (this.userLocalService.user?.id_rol === 1) {
      this.gridHeaderColumns += ' minmax(10rem, 1fr)';

      this.getAllCompanies();

      this.customerForm.addControl(
        'id_company',
        new FormControl('', [Validators.required])
      );
    }
  }

  private initForm(): void {
    this.customerForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      id_document: new FormControl('', [Validators.required]),
      identification: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
    });
  }

  private getAllCustomers(): void {
    this.listStatus.loadingTable = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.listStatus.loadingTable = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar los clientes',
          'danger',
          10000
        );
        this.listStatus.loadingTable = false;
      },
    });
  }

  private getAllTypesDocument(): void {
    this.typesDocumentService.getAllTypesDocument().subscribe({
      next: (typesDocument) => {
        this.typesDocument = typesDocument;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar los tipos de documento',
          'danger',
          10000
        );
      },
    });
  }

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar las compañias',
          'danger',
          10000
        );
      },
    });
  }

  private getAllDocumentsByCustomer(id_customer: string): void {
    this.listStatus.loadingTableDocumentsByCustomer = true;
    this.documentsByCustomer = [];
    this.documentService.getAllDocumentsByCustomer(id_customer).subscribe({
      next: (documents) => {
        this.listStatus.loadingTableDocumentsByCustomer = false;
        this.documentsByCustomer = documents;
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTableDocumentsByCustomer = false;
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar los documentos del cliente',
          'danger',
          10000
        );
      },
    });
  }

  public openModalCreateCustomer() {
    this.listStatus.showModal = true;
    this.customerForm.reset();
  }

  public createOrUpdateCustomer() {
    this.customerForm.markAllAsTouched();
    if (this.customerForm.valid) {
      const customer = { ...this.customerForm.value } as Customer;

      this.listStatus.savingCustomer = true;

      const endpointToExecute = this.idCustomerSelected
        ? this.customerService.updateCustomer(customer)
        : this.customerService.createCustomer(customer);

      endpointToExecute.subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllCustomers();
            this.notificationService.showNotification(
              `Cliente ${
                this.idCustomerSelected ? 'actualizado' : 'agregado'
              } exitosamente`,
              'success'
            );
            this.listStatus.showModal = false;
            this.globalService.detailCompany.customers.amount =
              this.globalService.detailCompany.customers?.amount + 1;
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.savingCustomer = false;
        },
        error: (error) => {
          this.listStatus.savingCustomer = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              this.idCustomerSelected ? 'actualizar' : 'agregar'
            } el cliente`,
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.idCustomerSelected = undefined;
    this.listStatus.showModal = false;
    this.documentsByCustomer = [];
  }

  public setUpdateCustomer(customer: Customer) {
    if ([1, 2].includes(this.userLocalService.user?.id_rol as number)) {
      this.idCustomerSelected = customer.identification;

      Object.keys(this.customerForm.value).forEach((key) =>
        this.customerForm
          .get(key)
          ?.setValue(customer[key as keyof typeof customer])
      );

      this.customerForm.markAllAsTouched();
      this.listStatus.showModal = true;

      this.getAllDocumentsByCustomer(customer.identification!);
    }
  }
}
