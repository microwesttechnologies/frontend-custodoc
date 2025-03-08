import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { Company } from 'src/app/models/company.model';
import { CompanyService } from 'src/app/services/external/company.service';
import { validateLimitText } from 'src/app/services/local/helper.service';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { UserLocalService } from '../../../../services/local/user.service';

@Component({
  selector: 'app-chose-company',
  standalone: true,
  imports: [SharedModule, NavbarComponent, TableComponent, TooltipDirective],
  templateUrl: './chose-company.component.html',
  styleUrl: './chose-company.component.scss',
})
export class ChoseCompanyComponent {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  public companies: Company[] = [];

  public searchControl = new FormControl();

  public fieldsToFilter = [
    'type',
    'phone',
    'nit',
    'name',
    'country',
    'city',
    'address',
  ];

  public listStatus = {
    loadingTable: true,
  };

  public validateLimitText = validateLimitText;

  private readonly notificationService = inject(NotificationService);
  public userLocalService = inject(UserLocalService);
  private readonly companyService = inject(CompanyService);

  ngOnInit(): void {
    this.getAllCompanies();
  }

  private getAllCompanies(): void {
    this.listStatus.loadingTable = true;
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.listStatus.loadingTable = false;
        this.companies = companies;
      },
      error: (error: HttpErrorResponse) => {
        this.listStatus.loadingTable = false;
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar las compañias',
          'danger',
          10000
        );
      },
    });
  }

  public initWithCompany(company: Company): void {
    this.userLocalService.companySelected = {
      id_company: company.id_company as number,
      type_company: company.type!,
      name: company.name,
      nit: company.nit!,
    };
    window.localStorage.setItem(
      'company',
      JSON.stringify(this.userLocalService.companySelected)
    );
    this.notificationService.showNotification(
      `Has iniciado sesión con la compañía ${company.name}`,
      'success'
    );
  }
}
