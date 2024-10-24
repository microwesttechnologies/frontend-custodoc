import { Component, Input, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from '../../../../shared-components/shared.module';
import { TableComponent } from '../../../../shared-components/table/table.component';
import { ModalComponent } from '../../../../shared-components/modal/modal.component';
import { ListFields } from '../../../../models/modal.model';
import { TypesDocumentService } from '../../../../services/external/TypesDocument.service';

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
  roleUser: string = '';
  nameTable: string = '';
  userName: string = '';
  totalCompanias: number = 0;
  titleModal: string = '';
  descriptionModal: string = '';
  listFields: ListFields[] = [];

  private typesDocumentService = inject(TypesDocumentService);

  ngOnInit(): void {
    this.titleModal = 'Crear usuario';
    this.descriptionModal = 'En este modulo podras crear usuarios';
    this.listFields = [
      {
        label: 'Nombre',
        key: 'userName',
        required: true,
      },
      {
        label: 'Tipo de documento',
        key: 'typeDocument',
        type: 'select',
        keyAutoComplete:'name',
        required: true,
      },
      {
        label: 'Numero de documento',
        key: 'numberDocument',
        required: true,
      },
      {
        label: 'Numero telefonico',
        key: 'phone',
        required: true,
      },
      {
        label: 'Correo electronico',
        key: 'emailUser',
        required: true,
      },
    ];
    this.nameTable = 'Usuarios';
    this.labelBtn = 'Crear Usuario';

    this.getAllTypesDocument();

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

    //   this.cdr.detectChanges();
    // } catch (error) {
    //   console.error('Error al obtener usuarios:', error);
    // }
  }

  private getAllTypesDocument(): void {
    this.typesDocumentService.getAllTypesDocument().subscribe({
      next: (response) => {
        this.listFields[1].data = response;
      },
    });
  }
}
