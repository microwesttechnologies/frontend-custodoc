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
export class SidebarComponent {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  public sidebarVisible: boolean = false;

  public userLocalService = inject(UserLocalService);
  private readonly userService = inject(UserService);

  logout(): void {
    this.userService.logout().subscribe({
      next: (response) => {
        if (response.status) {
          window.localStorage.removeItem('access_token');
          window.location.reload();
        }
      },
    });
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
