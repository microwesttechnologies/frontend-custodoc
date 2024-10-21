import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    CommonModule,
    RouterModule,
    ModalComponent 
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnChanges {
  @ViewChild('dt1') dt1!:     Table;
  @Input() labelRow:          any = [];
  @Input() items!:            any[];
  @Input() itemsTable!:       any[];
  @Input() inputsModal!:      any[];
  @Input() descriptionModal!: string;
  @Input() titleModal!:       string;
  @Input() nameTable!:        string;
  representatives!:           any[];
  searchValue:                string | undefined;
  loading:                    boolean = true;
  filterFields:               string[] = [];
  @Input() labelBtn:          string = 'Not Name';
  @Input() routerBtn:         string = '';
  @Input() showForm!:         boolean;
  modalVisible:               boolean = false;

  constructor() {}

  ngOnChanges(): void {
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
    console.log("punto modal" + this.modalVisible);
  }

  onModalClosed() {
    this.modalVisible = false; // Cerrar el modal al recibir el evento
  }
}
