import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-company-module',
  standalone: true,
  imports: [
    TooltipDirective,
    NavbarComponent,
    InputComponent,
    TableComponent,
    ModalComponent,
    SharedModule,
  ],
  templateUrl: './company-module.component.html',
  styleUrl: './company-module.component.scss',
})
export class CompanyModuleComponent {
  public companies: Company[] = [];

  public idCompanySelected?: number;
  public companyForm!: FormGroup;

  public nameFilter = '';

  public listStatus = {
    disabledAcceptButton: false,
    savingCompany: false,
    loadingTable: true,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;

  private readonly notificationService = inject(NotificationService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);
  private readonly formBuilder = inject(FormBuilder);

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
      phone: new FormControl('', [Validators.required]),
    });
  }

  private getAllCompanies(): void {
    this.listStatus.loadingTable = true;
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.listStatus.loadingTable = false;
        this.companies = companies;
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

  public openModalCreateCompany() {
    this.listStatus.disabledAcceptButton = false;
    this.listStatus.showModal = true;
    this.companyForm.reset();
  }

  public createCompany(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.valid) {
      this.listStatus.savingCompany = true;
      this.companyService
        .createCompany(this.companyForm.value as Company)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.getAllCompanies();
              this.notificationService.showNotification(
                'Compañía agregada exitosamente',
                'success'
              );
              this.listStatus.showModal = false;
              this.globalService.detailCompany.company!.amount =
                this.globalService.detailCompany.company?.amount! + 1;
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
              'Lo sentimos, no se pudo crear la compañia',
              'danger'
            );
          },
        });
    }
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
    this.idCompanySelected = undefined;
  }

  public setUpdateCompany(company: any) {
    this.idCompanySelected = company.id_company;

    Object.keys(this.companyForm.value).forEach((key) =>
      this.companyForm.get(key)?.setValue(company[key])
    );

    this.companyForm.markAllAsTouched();
    this.listStatus.showModal = true;
    this.listStatus.disabledAcceptButton = true;
    this.notificationService.showNotification(
      'Metodo de actualización en desarrollo',
      'success',
      100000
    );
  }
}
