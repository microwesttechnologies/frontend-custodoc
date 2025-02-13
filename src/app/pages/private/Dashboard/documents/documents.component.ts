import { Component, HostBinding, inject, Input, OnInit } from '@angular/core';
import { HistoryModuleComponent } from './history-module/history-module.component';
import { FoldersComponent } from './folders/folders.component';
import { UserLocalService } from 'src/app/services/local/user.service';
import { homologateText } from 'src/app/globals/homologate-text';
import { CustomerService } from 'src/app/services/external/customer.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { Customer } from 'src/app/models/customer.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [HistoryModuleComponent, FoldersComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  @Input() customers: Customer[] = [];

  private readonly notificationService = inject(NotificationService);
  private readonly customerService = inject(CustomerService);
  public userLocalService = inject(UserLocalService);

  ngOnInit(): void {
    this.getAllCustomers();
  }

  private getAllCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar los ${homologateText(
            this.userLocalService?.user?.type_company!,
            'clientes'
          )}`,
          'danger',
          10000
        );
      },
    });
  }
}
