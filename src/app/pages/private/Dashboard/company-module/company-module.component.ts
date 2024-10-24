import { Component, Input, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from 'src/app/shared-components/card/card.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { Company } from 'src/app/models/company.model';
import { ListFields } from 'src/app/models/modal.model';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CompanyService } from 'src/app/services/external/company.service';
import { GlobalService } from 'src/app/services/external/global.service';

@Component({
  selector: 'app-company-module',
  standalone: true,
  imports: [
    AvatarModule,
    CardComponent,
    TableComponent,
    ButtonModule,
    ModalComponent,
    SharedModule,
  ],
  templateUrl: './company-module.component.html',
  styleUrl: './company-module.component.scss',
  providers: [MessageService],
})
export class CompanyModuleComponent {
  @Input() labelBtn: string = '';
  @Input() routerBtn: string = '';
  @Input() showForm: boolean = false;

  itemsTable: any[] = [];
  nameTable: string = '';
  titleModal: string = '';
  descriptionModal: string = '';
  listFields!: ListFields;
  modalVisible = false;

  items = [
    { label: 'Documentos', acuracy: '5,423', icon: 'pi pi-users' },
    { label: 'Usuarios', acuracy: '1,893', icon: 'pi pi-user' },
    { label: 'Compañias', acuracy: '189', icon: 'pi pi-warehouse' },
    { label: 'Ciudades', acuracy: '32', icon: 'pi pi-warehouse' },
  ];

  private readonly messageService = inject(MessageService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);

  ngOnInit() {
    this.titleModal = 'Crear compañia';
    this.descriptionModal = 'En este modulo podras crear compañias';
    this.listFields = {
      name: {
        label: 'Nombre empresa',
        required: true,
      },
      nit: {
        label: 'NIT',
        required: true,
      },
      type: {
        label: 'Tipo',
        required: true,
      },
      country: {
        label: 'Pais',
        required: true,
      },
      city: {
        label: 'Ciudad',
        required: true,
      },
      address: {
        label: 'Direccion',
        required: true,
      },
      phone: {
        label: 'Telefono',
        required: true,
      },
    };

    this.nameTable = 'Compañías';
    this.labelBtn = 'Crear Compañia';

    this.getAllCompanies();
  }

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.itemsTable = companies?.map((company: Company) => ({
          Nit: company.nit,
          Nombre: company.name,
          Direccion: company.address,
          Ciudad: company.city,
          Telefono: company.phone,
        }));

        this.globalService.detailCompany.company!.amount = companies.length;
      },
    });
  }

  public createCompany(company: FormGroup): void {
    this.companyService.createCompany(company.value as Company).subscribe({
      next: (response) => {
        if (response.status) {
          this.modalVisible = false;
          this.getAllCompanies();
        }
      },
      error: (error) => {},
    });
  }
}
