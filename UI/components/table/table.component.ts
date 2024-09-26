import { HttpClientModule } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    HttpClientModule,
    ButtonModule,
    HttpClientModule,
    TableModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    CommonModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnChanges {
  @ViewChild('dt1') dt1!: Table;
  @Input() labelRow:  any = [];
  @Input() items!:    any[];
  @Input() user!:     any[];
  representatives!:   any[];
  searchValue:        string | undefined;
  loading:            boolean = true;
  filterFields:       string[] = [];
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.user && this.user.length > 0) {
      this.filterFields = Object.keys(this.user[0]);
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
}