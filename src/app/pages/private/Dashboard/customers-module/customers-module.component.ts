import { Component, Input, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { ListFields } from 'src/app/models/modal.model';
import { TypesDocumentService } from 'src/app/services/external/types-document.service';
import { CompanyService } from 'src/app/services/external/company.service';
import { UserLocalService } from 'src/app/services/local/user.service';
import { CustomerService } from 'src/app/services/external/customer.service';
import { FormGroup } from '@angular/forms';
import { Customer } from 'src/app/models/customer.model';
import { Company } from 'src/app/models/company.model';
import { TypesDocument } from 'src/app/models/types-document.model';
import { GlobalService } from 'src/app/services/external/global.service';

@Component({
  selector: 'app-customers-module',
  standalone: true,
  imports: [
    AvatarModule,
    SharedModule,
    TableComponent,
    ButtonModule,
    ModalComponent,
  ],
  templateUrl: './customers-module.component.html',
  styleUrl: './customers-module.component.scss',
})
export class CustomersModuleComponent {
  @Input() labelBtn: string = '';
  @Input() routerBtn: string = '';
  @Input() showForm: boolean = false;

  itemsTable: any[] = [];
  nameTable: string = '';
  titleModal: string = '';
  descriptionModal: string = '';
  listFields!: ListFields;
  modalVisible = false;

  private readonly typesDocumentService = inject(TypesDocumentService);
  private readonly userLocalService = inject(UserLocalService);
  private readonly customerService = inject(CustomerService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);

  ngOnInit(): void {
    this.titleModal = 'Crear cliente';
    this.descriptionModal = 'En este modulo podras crear clientes';
    this.listFields = {
      name: {
        label: 'Nombre',
        required: true,
      },
      id_document: {
        label: 'Tipo de documento',
        keyAutoComplete: 'name',
        required: true,
        type: 'select',
      },
      identification: {
        label: 'Numero de documento',
        required: true,
      },
      phone: {
        label: 'Numero telefonico',
        required: true,
      },
      email: {
        label: 'Correo electronico',
        required: true,
      },
    };

    if ((this.userLocalService.user.id_rol as number) === 1) {
      this.listFields = {
        ...this.listFields,
        id_company: {
          required: true,
          keyAutoComplete: 'name',
          type: 'autocomplete',
          label: 'Compañia',
        },
      };

      this.getAllCompanies();
    }

    this.nameTable = 'Clientes';
    this.labelBtn = 'Crear cliente';

    this.getAllTypesDocument();
    this.getAllCustomers();
  }

  private getAllCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.itemsTable = [
          ...customers.map((customer) => {
            let dataTable: any = {
              Identificación: customer.identification,
              'Tipo documento': customer.name_type_document,
              Nombre: customer.name,
              Email: customer.email,
              Telefono: customer.phone,
            };

            if (this.userLocalService.user.id_rol === 1) {
              dataTable = {
                ...dataTable,
                Compañia: customer.name_company,
              };
            }

            return dataTable;
          }),
        ];

        this.globalService.detailCompany.customers.amount = customers.length;
      },
    });
  }

  private getAllTypesDocument(): void {
    this.typesDocumentService.getAllTypesDocument().subscribe({
      next: (response) => {
        this.listFields['id_document'].data = response;
      },
    });
  }

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.listFields['id_company'].data = companies;
        this.listFields['id_company'].dataFilter = companies;
      },
    });
  }

  public createCustomer(customerForm: FormGroup) {
    const customer = { ...customerForm.value } as Customer;

    if (this.userLocalService.user.id_rol === 1) {
      customer.id_company = (customer.id_company as Company).id_company;
    }
    customer.id_document = (customer.id_document as TypesDocument).id_document;

    this.customerService.createCustomer(customer).subscribe({
      next: (response) => {
        if (response.status) {
          this.modalVisible = false;
          this.getAllCustomers();
        }
      },
      error: (error) => {},
    });
  }
}
