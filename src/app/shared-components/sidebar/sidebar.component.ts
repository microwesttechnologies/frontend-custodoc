import { Component, inject, ViewChild } from '@angular/core';
import { SidebarModule, Sidebar } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { UserService } from '../../services/local/user.service';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    StyleClassModule,
    SharedModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  sidebarVisible: boolean = false;

  menuItems: any[] = [
    {
      label: 'Administracion de documentos',
      icon: '',
      items: [{ label: 'Documentos', icon: 'pi pi-file', link: '/history' }],
    },
    {
      label: 'Administracion de usuarios',
      icon: '',
      items: [
        { label: 'Empleados', icon: 'pi pi-users', link: '/users' },
        { label: 'Clientes', icon: 'pi pi-user', link: '/customers' },
      ],
    },
    {
      label: 'Administracion de compañias',
      icon: '',
      items: [
        { label: 'Compañias', icon: 'pi pi-building', link: '/company' },
      ],
    },
  ];

  public userService = inject(UserService);

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
