import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { UserService } from 'src/app/services/external/user.service';
import { validateLimitText } from 'src/app/services/local/helper.service';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { TableComponent } from 'src/app/shared-components/table/table.component';

@Component({
  selector: 'app-ranking-module',
  standalone: true,
  imports: [
    TooltipDirective,
    NavbarComponent,
    ButtonComponent,
    TableComponent,
    InputComponent,
    SharedModule,
  ],
  templateUrl: './ranking-module.component.html',
  styleUrl: './ranking-module.component.scss',
})
export class RankingModuleComponent implements OnInit {
  public rankingUsers: any[] = [];
  public textFilter = '';
  public fieldsToFilter = [
    'name_user',
    'name_company',
    'identification',
    'total_documents',
  ];

  public rangeDatesControl = new FormControl();

  public listStatus = {
    loadingTable: false,
  };

  public validateLimitText = validateLimitText;

  private readonly notificationService = inject(NotificationService);
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.rangeDatesControl.markAsTouched();
    this.getAllRankingUsers();
  }

  public getAllRankingUsers() {
    let rangeDates = this.rangeDatesControl?.value?.split(' to ');
    if (rangeDates?.length !== 2) rangeDates = '';

    this.listStatus.loadingTable = true;
    this.userService.getAllRankingUsers(rangeDates).subscribe({
      next: (rankingUsers) => {
        this.listStatus.loadingTable = false;
        this.rankingUsers = rankingUsers;
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar el ranking de usuarios',
          'danger',
          10000
        );
      },
    });
  }
}
