import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import { SharedModule } from '../../../../shared-components/shared.module';
import { CardComponent } from '../../../../shared-components/card/card.component';
import { TableComponent } from '../../../../shared-components/table/table.component';
import { ModalComponent } from '../../../../shared-components/modal/modal.component';
import { ListFields } from '../../../../models/modal.model';

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [
    AvatarModule,
    CardComponent,
    SharedModule,
    TableComponent,
    ButtonModule,
    ModalComponent,
  ],
  templateUrl: './users-module.component.html',
  styleUrl: './users-module.component.scss',
})
export class UsersModuleComponent {
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

  constructor() {}

  ngOnInit(): void {
    this.titleModal = 'Crear usuario';
    this.descriptionModal = 'En este modulo podras crear usuarios';
    this.listFields = [
      {
        label: 'Nombre',
        key: 'userName',
      },
      {
        label: 'Tipo de documento',
        key: 'typeDocument',
      },
      {
        label: 'Numero de documento',
        key: 'numberDocument',
      },
      {
        label: 'Numero telefonico',
        key: 'phone',
      },
      {
        label: 'Correo electronico',
        key: 'emailUser',
      },
    ];
    this.roleUser = localStorage.getItem('userRole') ?? '';
    this.userName = localStorage.getItem('userName') ?? '';

    // try {
    //   const companyResponse = await firstValueFrom(
    //     this.getAllUserUseCase.getAllUser()
    //   );

    //   const companyData =
    //     companyResponse?.map((user: User) => ({
    //       id: user.id,
    //       Nombre: user.nameUser,
    //       Correo: user.emailUser,
    //     })) || [];

    //   this.itemsTable = [...companyData];
    //   this.totalCompanias = companyData.length;
    //   this.nameTable = 'Usuarios';
    //   this.labelBtn = 'Crear Usuario';

    //   this.cdr.detectChanges();
    // } catch (error) {
    //   console.error('Error al obtener usuarios:', error);
    // }
  }
}
