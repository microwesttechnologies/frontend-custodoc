import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from 'UI/components/table/table.component';
import { CardComponent } from 'UI/components/card/card.component';
import { GetAllCompanyUseCase } from 'Core/Domain/UseCase/GetAllCompanyUseCases';
import { Company } from 'Core/Domain/Model/Company.Model';
import { ModalComponent } from 'UI/components/modal/modal.component';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-company-module',
  standalone: true,
  imports: [AvatarModule, CardComponent, CommonModule, TableComponent, ButtonModule, ModalComponent],
  templateUrl: './company-module.component.html',
  styleUrl: './company-module.component.scss',
  providers: [
    GetAllCompanyUseCase,

  ],
})
export class CompanyModuleComponent {
  itemsTable: any[] = [];
  roleUser: string = '';
  nameTable: string = '';
  userName: string = '';
  totalCompanias: number = 0;
  @Input() labelBtn: string = "";
  @Input() routerBtn: string = "";
  @Input() showForm: boolean = false;
  titleModal: string = '';
  descriptionModal: string = '';
  inputsModal: any[] = [];

  constructor(
    private getAllCompanyUseCase: GetAllCompanyUseCase,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.titleModal="Crear compañia"
    this.descriptionModal="En este modulo podras crear compañias"
    this.inputsModal=[
      {
        label: 'Nombre empresa',
        input: 'companyName'
      },
      {
        label: 'NIT',
        input: 'numberIdentification'
      },
      {
        label: 'Direccion',
        input: 'addres'
      },
      {
        label: 'Ciudad',
        input: 'city'
      },
      {
        label: 'Telefono',
        input: 'numberPhone'
      },
      {
        label: 'Correo facturacion',
        input: 'email'
      },
      {
        label: 'Nombre administrador',
        input: 'nameAdmin'
      },
      {
        label: 'Correo administrador',
        input: 'emailAdmin'
      },
      {
        label: 'Correo administrador',
        input: 'emailAdmin'
      },
      {
        label: 'Telefono administrador',
        input: 'phoneAdmin'
      },
    ]
    this.roleUser = localStorage.getItem('userRole') || '';
    this.userName = localStorage.getItem('userName') || '';

    try {
      const companyResponse = await firstValueFrom(this.getAllCompanyUseCase.getAllCompanies());
      
      const companyData = companyResponse?.map((company: Company) => ({
        id: company.id,
        Nombre: company.nameCompany,
        Direccion: company.addressCompany,
        Tipo: company.typeCompany,
        Ciudad: company.cityCompany,
      })) || [];
    
      this.itemsTable = [...companyData];
      this.totalCompanias = companyData.length;
      this.nameTable = "Compañías";
      this.labelBtn = "Crear Compañia";
    
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }
  
  items = [
    { label: 'Documentos', acuracy: '5,423', icon: 'pi pi-users' },
    { label: 'Usuarios', acuracy: '1,893', icon: 'pi pi-user' },
    { label: 'Compañias', acuracy: '189', icon: 'pi pi-warehouse' },
    { label: 'Ciudades', acuracy: '32', icon: 'pi pi-warehouse' },
  ];
}
