import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, inject } from '@angular/core';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { Company } from 'src/app/models/company.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CompanyService } from 'src/app/services/external/company.service';
import { GlobalService } from 'src/app/services/external/global.service';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import {
  validateLimitText,
  validateFormField,
} from 'src/app/services/local/helper.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { TabsModule } from 'src/app/shared-components/tabs/tabs.module';
import { User } from 'src/app/models/user.model';
import { CustomerService } from 'src/app/services/external/customer.service';
import { UserService } from 'src/app/services/external/user.service';
import { Customer } from 'src/app/models/customer.model';
import { Router } from '@angular/router';
import { SelectComponent } from 'src/app/shared-components/form/select/select.component';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';

@Component({
  selector: 'app-company-module',
  standalone: true,
  imports: [
    ModalConfirmationDeleteComponent,
    DisabledByPermissionDirective,
    DisabledElementDirective,
    TooltipDirective,
    NavbarComponent,
    SelectComponent,
    InputComponent,
    TableComponent,
    ModalComponent,
    SharedModule,
    TabsModule,
  ],
  templateUrl: './company-module.component.html',
  styleUrl: './company-module.component.scss',
})
export class CompanyModuleComponent {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  public companyTypes: { name: string }[] = [];
  public customersByCompany: Customer[] = [];
  public usersByCompany: User[] = [];
  public companies: Company[] = [];

  public idCompanySelected?: number;
  public companyToDelete?: Company;
  public companyForm!: FormGroup;

  public searchControl = new FormControl();

  public fieldsToFilter = [
    'type',
    'phone',
    'nit',
    'name',
    'country',
    'city',
    'address',
  ];

  public selectedTabIndex = 0;

  public listStatus = {
    savingCompany: false,
    loadingTable: true,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;

  private readonly notificationService = inject(NotificationService);
  private readonly customerService = inject(CustomerService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  public router = inject(Router);

  ngOnInit() {
    this.initForm();
    this.getAllCompanies();
  }

  private initForm(): void {
    this.companyForm = this.formBuilder.group({
      id_company: new FormControl(''),
      nit: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
    });
  }

  private getAllCompanies(): void {
    this.listStatus.loadingTable = true;
    this.companyTypes = [];
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.listStatus.loadingTable = false;
        this.companies = companies;

        this.companies.forEach((company, index) =>
          this.companyTypes.push({ name: company.type! })
        );

        this.companyTypes.push({ name: 'Otro' });
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar las compañias',
          'danger',
          10000
        );
      },
    });
  }

  private getUsersByCompany(): void {
    this.userService.getAllUsers(this.idCompanySelected).subscribe({
      next: (users) => (this.usersByCompany = users),
    });
  }

  private getCustomersByCompany(): void {
    this.customerService.getAllCustomers(this.idCompanySelected).subscribe({
      next: (customers) => (this.customersByCompany = customers),
    });
  }

  public openModalCreateCompany() {
    this.listStatus.showModal = true;
    this.companyForm.reset();
  }

  public createOrUpdateCompany(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.valid) {
      const endpointToExecute = this.idCompanySelected
        ? this.companyService.updateCompany(this.companyForm.value as Company)
        : this.companyService.createCompany(this.companyForm.value as Company);

      this.listStatus.savingCompany = true;
      endpointToExecute.subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllCompanies();
            this.notificationService.showNotification(
              `Compañía ${
                this.idCompanySelected ? 'actualizada' : 'agregada'
              } exitosamente`,
              'success'
            );
            this.closeModal();
            // if (!this.idCompanySelected)
            //   this.globalService.detailCompany.company!.amount =
            //     this.globalService.detailCompany.company?.amount! + 1;
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.savingCompany = false;
        },
        error: (error) => {
          this.listStatus.savingCompany = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              this.idCompanySelected ? 'actualizar' : 'agrer'
            } la compañia`,
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.idCompanySelected = undefined;
    this.listStatus.showModal = false;
    this.customersByCompany = [];
    this.usersByCompany = [];
  }

  public setUpdateCompany(company: any) {
    this.idCompanySelected = company.id_company;
    this.getCustomersByCompany();
    this.getUsersByCompany();

    Object.keys(this.companyForm.value).forEach((key) =>
      this.companyForm.get(key)?.setValue(company[key])
    );

    this.companyForm.markAllAsTouched();
    this.listStatus.showModal = true;
  }

  public deleteCompany(): void {
    this.companyService
      .deleteCompany(this.companyToDelete?.id_company as number)
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.notificationService.showNotification(
              `Compañía eliminada exitosamente`,
              'success'
            );
            this.companies = this.companies.filter(
              (company) =>
                company.id_company !== this.companyToDelete?.id_company
            );
            // this.globalService.detailCompany.company!.amount =
            //   this.companies.length;
            this.companyToDelete = undefined;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo eliminar la compañía`,
            'danger'
          );
        },
      });
  }
}
