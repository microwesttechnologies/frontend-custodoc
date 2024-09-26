import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from 'UI/components/table/table.component';
import { CardComponent } from 'UI/components/card/card.component';
import { GetAllUserUseCases } from 'Core/Domain/UseCase/GetAllUserUseCase';
import { User } from 'Core/Domain/Model/User.Model';
import { GetAllUserGateway } from 'Core/Domain/Gateway/GetAllUser.Gateway';
import { GetAllUsersService } from 'Core/Infraestructura/driver-adapter/Services/GetAllUser.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AvatarModule,
    CardComponent,
    CommonModule,
    TableComponent,
    ButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [
    GetAllUserUseCases,
    { provide: GetAllUserGateway, useClass: GetAllUsersService },
  ],
})
export class DashboardComponent implements OnInit {
  username: string = 'Carlos Villanueva';
  activityValues: number[] = [0, 100];
  user: User[] = [];
  filterFields: string[] = [];


  constructor(private getUserUseCases: GetAllUserUseCases) {}

  ngOnInit(): void {
    this.getUserUseCases.getAllUser().subscribe((response: any) => {
      if (response !== undefined && response !== null) {
        this.user = response.map((user: any) => {
          return {
            id: user.id,
            Nombre: user.nameUser,
            Correo: user.emailUser,
            Estado: user.state,  
            Rol: user.role 
          };
        });
        console.log(this.user);
  
      }
    });
    
    
  }

  items: any[] = [
    {
      label: 'Historias clínicas',
      acuracy: '5,423',
      icon: 'pi pi-users',
    },
    {
      label: 'Usuarios',
      acuracy: '1,893',
      icon: 'pi pi-user',
    },
    {
      label: 'Hospitales',
      acuracy: '189',
      icon: 'pi pi-warehouse',
    },
    {
      label: 'Ciudades',
      acuracy: '32',
      icon: 'pi pi-warehouse',
    },
  ];
}