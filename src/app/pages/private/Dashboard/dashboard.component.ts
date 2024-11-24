import { Component } from '@angular/core';
import { SidebarComponent } from 'src/app/shared-components/sidebar/sidebar.component';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  public isSidebarOpened = false;

  constructor() {}
}
