import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from 'UI/components/table/table.component';
import { CardComponent } from 'UI/components/card/card.component';
import { GetAllHistoryUserUseCase } from 'Core/Domain/UseCase/GetAllHistoryUserUseCase';
import { HistoryUser } from 'Core/Domain/Model/HistoryUser.Model';
import { ModalComponent } from 'UI/components/modal/modal.component';
import { firstValueFrom } from 'rxjs';
import { GetAllUserUseCases } from 'Core/Domain/UseCase/GetAllUserUseCase';
import { User } from 'Core/Domain/Model/User.Model';

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [AvatarModule, CardComponent, CommonModule, TableComponent, ButtonModule, ModalComponent],
  templateUrl: './users-module.component.html',
  styleUrl: './users-module.component.scss',
  providers: [GetAllUserUseCases]
})
export class UsersModuleComponent {
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
    private getAllUserUseCase: GetAllUserUseCases,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.titleModal="Crear usuario"
    this.descriptionModal="En este modulo podras crear usuarios"
    this.inputsModal=[
      {
        label: 'Nombre',
        input: 'userName'
      },
      {
        label: 'Tipo de documento',
        input: 'typeDocument'
      },
      {
        label: 'Numero de documento',
        input: 'numberDocument'
      },
      {
        label: 'Numero telefonico',
        input: 'phone'
      },
      {
        label: 'Correo electronico',
        input: 'emailUser'
      },
    ]
    this.roleUser = localStorage.getItem('userRole') || '';
    this.userName = localStorage.getItem('userName') || '';

    try {
      const companyResponse = await firstValueFrom(this.getAllUserUseCase.getAllUser());
      
      const companyData = companyResponse?.map((user: User) => ({
        id: user.id,
        Nombre: user.nameUser,
        Correo: user.emailUser       
      })) || [];
    
      this.itemsTable = [...companyData];
      this.totalCompanias = companyData.length;
      this.nameTable = "Usuarios";
      this.labelBtn = "Crear Usuario";
    
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
