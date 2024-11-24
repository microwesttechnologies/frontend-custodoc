import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserLocalService } from 'src/app/services/local/user.service';
import { SharedModule } from '../shared.module';
import { UserService } from 'src/app/services/external/user.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { slideCustomAnimation } from 'src/app/animations/global.animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TooltipDirective, SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    slideCustomAnimation(
      'slideEnterAndLeaveLeft',
      'X',
      '-1rem',
      '0',
      {
        enter: '300ms',
        leave: '300ms',
      },
      { enter: true, leave: true }
    ),
  ],
})
export class SidebarComponent {
  @Output() isSidebarOpenedChange = new EventEmitter<boolean>();
  @Input() isSidebarOpened = false;

  public showContent = this.isSidebarOpened;

  public userLocalService = inject(UserLocalService);
  private readonly userService = inject(UserService);

  public openAndCloseSidebar(): void {
    this.isSidebarOpened = !this.isSidebarOpened;
    this.isSidebarOpenedChange.emit(this.isSidebarOpened);

    setTimeout(
      () => (this.showContent = this.isSidebarOpened),
      this.isSidebarOpened ? 0 : 300
    );
  }

  public logout(): void {
    this.userService.logout().subscribe({
      next: (response) => {
        if (response.status) {
          window.localStorage.removeItem('access_token');
          window.location.reload();
        }
      },
    });
  }
}
