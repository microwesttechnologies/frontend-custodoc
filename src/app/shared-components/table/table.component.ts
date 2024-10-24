import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ModalComponent } from '../modal/modal.component';
import { ListFields } from 'src/app/models/modal.model';
import { SharedModule } from '../shared.module';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    SharedModule,
    ModalComponent,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnChanges {
  @ViewChild('dt1') dt1!: Table;
  @Input() labelRow: any = [];
  @Input() itemsTable!: any[];
  @Input() listFields!: ListFields;
  @Input() descriptionModal!: string;
  @Input() titleModal!: string;
  @Input() nameTable!: string;
  @Input() labelBtn: string = 'Not Name';
  @Input() routerBtn: string = '';
  @Input() showForm!: boolean;
  @Input() modalVisible!: boolean;
  @Input() withFile!: boolean;

  @Output() saveData = new EventEmitter<{ form: FormGroup; file?: File }>();
  @Output() modalVisibleChange = new EventEmitter<boolean>();

  representatives!: any[];
  searchValue: string | undefined;
  loading: boolean = true;
  filterFields: string[] = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemsTable && this.itemsTable.length > 0) {
      this.filterFields = Object.keys(this.itemsTable[0]);
    }
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt1.filterGlobal(input.value, 'contains');
  }

  getProperties(obj: any) {
    if (obj === undefined || obj === null) {
      return [];
    }
    return Object.keys(obj);
  }

  openModal() {
    this.modalVisible = true; // Abrir el modal
    this.modalVisibleChange.emit(this.modalVisible);
  }

  onModalClosed() {
    this.modalVisible = false; // Cerrar el modal al recibir el evento
    this.modalVisibleChange.emit(this.modalVisible);
  }
}
