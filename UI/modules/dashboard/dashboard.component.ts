import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CustomerService } from 'UI/services/costumer.service';
import { TableComponent } from 'UI/components/table/table.component';
import { CardComponent } from 'UI/components/card/card.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ AvatarModule, CardComponent, CommonModule, TableComponent, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [CustomerService]

})
export class DashboardComponent implements OnInit {

username: string = "Carlos Villanueva";
  activityValues: number[] = [0, 100];

  constructor() {}

  ngOnInit() {}

  labelRow = [
    {label: "nombre"},
    {label: "Direccion"}
  ];
  
  items: any[] = [
    {
      label:"Historias clínicas",
      acuracy:"5,423",
      icon: "pi pi-users"
    },
    {
      label:"Usuarios",
      acuracy:"1,893",
      icon: "pi pi-user"
    },
    {
      label:"Hospitales",
      acuracy:"189",
      icon: "pi pi-warehouse"
    },
    {
      label:"Ciudades",
      acuracy:"32",
      icon: "pi pi-warehouse"
    },
    
  ]



}
