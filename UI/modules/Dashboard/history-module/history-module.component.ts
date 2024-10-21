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

@Component({
  selector: 'app-history-module',
  standalone: true,
  imports: [AvatarModule, CardComponent, CommonModule, TableComponent, ButtonModule, ModalComponent],
  templateUrl: './history-module.component.html',
  styleUrl: './history-module.component.scss',
  providers: [GetAllHistoryUserUseCase]
})
export class HistoryModuleComponent {
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
    private getAllHistoryUseCase: GetAllHistoryUserUseCase,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.titleModal="Crear documento"
    this.descriptionModal="En este modulo podras crear documentos"
    this.inputsModal=[
      {
        label: 'Nombre del documento',
        input: 'nameDocument'
      },
      {
        label: 'Usuario',
        input: 'userName'
      },
      {
        label: 'N° Identidad',
        input: 'numberIdentification'
      },
      {
        label: 'Descripcion',
        input: 'description'
      }
    ]
    this.roleUser = localStorage.getItem('userRole') || '';
    this.userName = localStorage.getItem('userName') || '';

    try {
      const companyResponse = await firstValueFrom(this.getAllHistoryUseCase.getAllHistoryUsers());
      
      const companyData = companyResponse?.map((history: HistoryUser) => ({
        id: history.id,
        Nombre: history.nameDocument,
        Descripcion: history.description,
        Ruta: history.routeDocument
       
      })) || [];
    
      this.itemsTable = [...companyData];
      this.totalCompanias = companyData.length;
      this.nameTable = "Documentos";
      this.labelBtn = "Crear Documento";
    
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
