import { Component, Input, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardComponent } from '../../../../shared-components/card/card.component';
import { ModalComponent } from '../../../../shared-components/modal/modal.component';
import { TableComponent } from '../../../../shared-components/table/table.component';
import { SharedModule } from '../../../../shared-components/shared.module';
import { CompanyService } from '../../../../services/external/Company.service';
import { Company } from '../../../../models/company.model';
import { UserService } from '../../../../services/local/user.service';
import { ListFields } from '../../../../models/modal.model';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';

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
  roleUser: string = '';
  nameTable: string = '';
  userName: string = '';
  totalCompanias: number = 0;
  titleModal: string = '';
  descriptionModal: string = '';
  listFields: ListFields[] = [];
  modalVisible = false;

  items = [
    { label: 'Documentos', acuracy: '5,423', icon: 'pi pi-users' },
    { label: 'Usuarios', acuracy: '1,893', icon: 'pi pi-user' },
    { label: 'Compañias', acuracy: '189', icon: 'pi pi-warehouse' },
    { label: 'Ciudades', acuracy: '32', icon: 'pi pi-warehouse' },
  ];

  private readonly messageService = inject(MessageService);
  private readonly companyService = inject(CompanyService);
  public readonly userService = inject(UserService);

  ngOnInit() {
    this.titleModal = 'Crear compañia';
    this.descriptionModal = 'En este modulo podras crear compañias';
    this.listFields = [
      {
        label: 'Nombre empresa',
        key: 'name',
        required: true,
      },
      {
        label: 'NIT',
        key: 'nit',
        required: true,
      },
      {
        label: 'Tipo',
        key: 'type',
        required: true,
      },
      {
        label: 'Pais',
        key: 'country',
        required: true,
      },
      {
        label: 'Ciudad',
        key: 'city',
        required: true,
      },
      {
        label: 'Direccion',
        key: 'address',
        required: true,
      },
      {
        label: 'Telefono',
        key: 'phone',
        required: true,
      },
    ];

    this.getAllCompanies();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Compañía agregada exitosamente',
    });
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

        this.totalCompanias = companies.length;
        this.nameTable = 'Compañías';
        this.labelBtn = 'Crear Compañia';
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
