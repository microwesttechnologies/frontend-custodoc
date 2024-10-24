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
  selector: 'app-history-module',
  standalone: true,
  imports: [
    AvatarModule,
    CardComponent,
    SharedModule,
    TableComponent,
    ButtonModule,
    ModalComponent,
  ],
  templateUrl: './history-module.component.html',
  styleUrl: './history-module.component.scss',
  providers: [],
})
export class HistoryModuleComponent {
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

  ngOnInit(): void {
    this.titleModal = 'Crear documento';
    this.descriptionModal = 'En este modulo podras crear documentos';
    this.listFields = [
      {
        label: 'Nombre del documento',
        key: 'nameDocument',
      },
      {
        label: 'Usuario',
        key: 'userName',
      },
      {
        label: 'N° Identidad',
        key: 'numberIdentification',
      },
      {
        label: 'Descripcion',
        key: 'description',
      },
    ];
    this.roleUser = localStorage.getItem('userRole') ?? '';
    this.userName = localStorage.getItem('userName') ?? '';

    // try {
    //   const companyResponse = await firstValueFrom(
    //     this.usersUseCases.getAllHistoryUsers()
    //   );

    //   const companyData =
    //     companyResponse?.map((history: HistoryUser) => ({
    //       id: history.id,
    //       Nombre: history.nameDocument,
    //       Descripcion: history.description,
    //       Ruta: history.routeDocument,
    //     })) || [];

    //   this.itemsTable = [...companyData];
    //   this.totalCompanias = companyData.length;
    //   this.nameTable = 'Documentos';
    //   this.labelBtn = 'Crear Documento';

    //   this.cdr.detectChanges();
    // } catch (error) {
    //   console.error('Error al obtener usuarios:', error);
    // }
  }
}
