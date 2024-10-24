import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared-components/sidebar/sidebar.component';
import { SharedModule } from '../../../shared-components/shared.module';
import { ListCardsComponent } from '../../../shared-components/list-cards/list-cards.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, SidebarComponent, ListCardsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor() {}
}
