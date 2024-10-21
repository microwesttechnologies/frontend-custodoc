import { Component, ViewChild } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { Sidebar } from 'primeng/sidebar';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    StyleClassModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  menuItems: any[] = [
    {
      label: 'Administracion de documentos',
      icon: '',
      items: [
        { label: 'Crear documentos', icon: 'pi pi-home', link: '/history' },
        { label: 'Subir documentos', icon: 'pi pi-home', link: '/history' },
      ]
    },
    {
      label: 'Administracion de usuarios',
      icon: '',
      items: [
        { label: 'Crear usuario', icon: 'pi pi-folder', link: '/users' },
      ]
    },
    {
      label: 'Administracion de compañias',
      icon: '',
      items: [
        { label: 'Crear compañia', icon: 'pi pi-folder', link: '/company'  },
      ]
    }
  ];

  closeCallback(e: any): void {
      this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = true;
    
    
}
