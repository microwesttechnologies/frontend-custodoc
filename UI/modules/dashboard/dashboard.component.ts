import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AvatarGroupModule, AvatarModule, CardModule, CommonModule, TableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  items: any[] = [
    {
      label:"Total Historias clínicas",
      acuracy:"5,423",
      icon: "pi pi-users"
    },
    {
      label:"Total de usuarios",
      acuracy:"1,893",
      icon: "pi pi-user"
    },
    {
      label:"Hospitales",
      acuracy:"189",
      icon: "pi pi-warehouse"
    },
    
  ]

  products: any[] = [
    { code: 'P001', name: 'Product 1', category: 'Category A', quantity: 100 },
    { code: 'P002', name: 'Product 2', category: 'Category B', quantity: 150 },
    { code: 'P003', name: 'Product 3', category: 'Category A', quantity: 200 }
  ];

}
