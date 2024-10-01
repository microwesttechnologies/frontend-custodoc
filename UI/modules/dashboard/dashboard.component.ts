import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from 'UI/components/table/table.component';
import { CardComponent } from 'UI/components/card/card.component';
import { GetAllUserUseCases } from 'Core/Domain/UseCase/GetAllUserUseCase';
import { GetAllUserGateway } from 'Core/Domain/Gateway/GetAllUser.Gateway';
import { GetAllUsersService } from 'Core/Infraestructura/driver-adapter/Services/GetAllUser.service';
import { GetAllHistoryUserUseCase } from 'Core/Domain/UseCase/GetAllHistoryUserUseCase'; 
import { GetAllCompanyUseCase } from 'Core/Domain/UseCase/GetAllCompanyUseCases';
import { Company } from 'Core/Domain/Model/Company.Model';
import { User } from 'Core/Domain/Model/User.Model';
import { HistoryUser } from 'Core/Domain/Model/HistoryUser.Model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AvatarModule, CardComponent, CommonModule, TableComponent, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    GetAllUserUseCases,
    { provide: GetAllUserGateway, useClass: GetAllUsersService },
    GetAllHistoryUserUseCase,
    GetAllCompanyUseCase,
  ],
})
export class DashboardComponent implements OnInit {
  itemsTable: any[] = [];
  roleUser: string = '';
  nameTable: string = '';
  userName: string = '';
  totalCompanias: number = 0;

  constructor(
    private getAllUserUseCases: GetAllUserUseCases,
    private getAllHistoryUserUseCase: GetAllHistoryUserUseCase,
    private getAllCompanyUseCase: GetAllCompanyUseCase,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.roleUser = localStorage.getItem('userRole') || '';
    this.userName = localStorage.getItem('userName') || '';

    try {
      const response = await this.getAllUserUseCases.getAllUser().toPromise();
  
      if (response) {
        const userData = response.map((user: User) => ({
          id: user.id,
          Nombre: user.nameUser,
          Correo: user.emailUser,
          Estado: user.state,
          Rol: user.role,
        }));
  
        if (this.roleUser === 'medico' || this.roleUser === 'cargue') {
          this.nameTable = "Historias Clinicas";
          const historyResponse = await this.getAllHistoryUserUseCase.getAllHistoryUsers().toPromise();
          const historyData = historyResponse?.map((history: HistoryUser) => ({
            id: history.id,
            Documento: history.nameDocument,
            Ruta: history.routeDocument,
            Rescripcion: history.description,
          })) || [];
  
          this.itemsTable = [...historyData];
        } else if (this.roleUser === 'root') {
          this.nameTable = "Compañías";
          const companyResponse = await this.getAllCompanyUseCase.getAllCompanies().toPromise();
          const companyData = companyResponse?.map((company: Company) => ({
            id: company.id,
            Nombre: company.nameCompany,
            Direccion: company.addressCompany,
            Tipo: company.typeCompany,
            Ciudad: company.cityCompany,
          })) || [];
  
          this.itemsTable = [...companyData];
          this.totalCompanias = companyData.length;
        } else {
          this.itemsTable = userData;
        }
  
        this.cdr.detectChanges();
        console.log("Número de elementos en itemsTable: " + this.itemsTable.length);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }
  
  items = [
    { label: 'Historias clínicas', acuracy: '5,423', icon: 'pi pi-users' },
    { label: 'Usuarios', acuracy: '1,893', icon: 'pi pi-user' },
    { label: 'Hospitales', acuracy: '189', icon: 'pi pi-warehouse' },
    { label: 'Ciudades', acuracy: '32', icon: 'pi pi-warehouse' },
  ];
}
