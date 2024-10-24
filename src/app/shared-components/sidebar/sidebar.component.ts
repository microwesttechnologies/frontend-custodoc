import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SidebarModule, Sidebar } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { UserLocalService } from 'src/app/services/local/user.service';
import { SharedModule } from '../shared.module';
import { UserService } from 'src/app/services/external/user.service';

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
export class SidebarComponent implements OnInit {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  public sidebarVisible: boolean = false;

  public menuItems: any[] = [
    {
      label: 'Administracion de documentos',
      icon: '',
      items: [{ label: 'Documentos', icon: 'pi pi-file', link: '/documents' }],
    },
  ];

  public userLocalService = inject(UserLocalService);
  private userService = inject(UserService);

  ngOnInit(): void {
    if ([1, 2].includes(this.userLocalService.user.id_rol as number)) {
      this.menuItems.unshift({
        label: 'Administracion de usuarios',
        icon: '',
        items: [
          { label: 'Empleados', icon: 'pi pi-users', link: '/users' },
          { label: 'Clientes', icon: 'pi pi-user', link: '/customers' },
        ],
      });
      if (this.userLocalService.user.id_rol === 1) {
        this.menuItems.unshift({
          label: 'Administracion de compañias',
          icon: '',
          items: [
            { label: 'Compañias', icon: 'pi pi-building', link: '/company' },
          ],
        });
      }
    } else if (this.userLocalService.user.id_rol === 3) {
      this.menuItems.unshift({
        label: 'Administracion de usuarios',
        icon: '',
        items: [{ label: 'Clientes', icon: 'pi pi-user', link: '/customers' }],
      });
    }
  }

  logout(): void {
    this.userService.logout().subscribe({ next: (response) => {
      if(response.status){
        window.localStorage.removeItem('access_token');
        window.location.reload();
      }
    } });
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
