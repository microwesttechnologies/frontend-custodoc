import { Component } from '@angular/core';
import { SidebarComponent } from 'src/app/shared-components/sidebar/sidebar.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { fromEvent, takeUntil } from 'rxjs';
import { DestroyObs } from 'src/app/abstract-classes/destroy.abstract';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends DestroyObs {
  public isSidebarOpened = false;
  public heightPage = `${
    window.innerHeight - (window.innerWidth <= 768 ? 64 : 0)
  }px`;

  constructor() {
    super();
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        () =>
          (this.heightPage = `${
            window.innerHeight - (window.innerWidth <= 768 ? 64 : 0)
          }px`)
      );
  }
}
