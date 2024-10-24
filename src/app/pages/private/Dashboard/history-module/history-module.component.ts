import { Component, inject, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { CardComponent } from 'src/app/shared-components/card/card.component';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { ListFields } from 'src/app/models/modal.model';
import { GlobalService } from 'src/app/services/external/global.service';
import { DocumentService } from 'src/app/services/external/document.service';
import { FormGroup } from '@angular/forms';
import { CustomerService } from 'src/app/services/external/customer.service';
import { Customer } from 'src/app/models/customer.model';

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
  nameTable: string = '';
  titleModal: string = '';
  descriptionModal: string = '';
  listFields!: ListFields;
  modalVisible = false;

  private readonly documentsService = inject(DocumentService);
  private readonly customerService = inject(CustomerService);
  private readonly globalService = inject(GlobalService);

  ngOnInit(): void {
    this.titleModal = 'Agregar documento';
    this.descriptionModal = 'En este modulo podras agregar documentos';

    this.listFields = {
      name: {
        label: 'Nombre del documento',
        required: true,
      },
      identification: {
        label: 'Usuario',
        required: true,
        keyAutoComplete: 'name',
        type: 'autocomplete',
      },
      description: {
        label: 'Descipción',
        type: 'textarea',
      },
    };

    this.nameTable = 'Documents';
    this.labelBtn = 'Agregar documento';

    this.getAllCustomers();
    this.getAllDocuments();
  }

  private getAllCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.listFields['identification'].dataFilter = customers;
        this.listFields['identification'].data = customers;
      },
    });
  }

  private getAllDocuments(): void {
    this.documentsService.getAllDocuments().subscribe({
      next: (documents) => {
        this.itemsTable = [
          ...documents.map((document) => {
            return {
              Id: document.id_history,
              Nombre: document.name,
              'Identificación cliente': document.identification,
              'Nombre cliente': document.name_customer,
              Descripción: document.description,
              Archivo: '',
            };
          }),
        ];

        this.globalService.detailCompany.documents.amount = documents.length;
      },
    });
  }

  public createDocument(data: { form: FormGroup; file?: File }): void {
    const formData = new FormData();

    Object.entries(data.form.value).forEach((elm: any[]) => {
      formData.append(
        elm[0],
        elm[0] === 'identification'
          ? (elm[1] as Customer).identification
          : elm[1] || ''
      );
    });
    formData.append('file', data.file!);

    this.documentsService.createDocument(formData).subscribe({
      next: (response) => {
        if (response.status) {
          this.getAllDocuments();
          this.modalVisible = false;
        }
      },
    });
  }
}
