import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { RolService } from 'src/app/services/external/rol.service';
import { RolPermissions } from 'src/app/models/rol.model';
import { ItemSkeletonComponent } from 'src/app/shared-components/item-skeleton/item-skeleton.component';
import {
  arrayFilter,
  createArrayByNumber,
} from 'src/app/services/local/helper.service';
import {
  collapseAnimation,
  slideCustomAnimation,
} from 'src/app/animations/global.animations';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { RoutesService } from 'src/app/services/external/routes.service';

import { Routes } from 'src/app/models/routes.model';
import { ModalCreateAndUpdateRolComponent } from './modal-create-and-update-rol/modal-create-and-update-rol.component';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    ModalCreateAndUpdateRolComponent,
    DisabledByPermissionDirective,
    ItemSkeletonComponent,
    NavbarComponent,
    TableComponent,
    SharedModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  animations: [
    collapseAnimation,
    slideCustomAnimation('slideEnterAndLeaveRight', 'X', '1rem', '0', {
      enter: '300ms',
      leave: '300ms',
    }),
  ],
})
export class RolesComponent implements OnInit {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  public rolesAndPermissionsFilter: RolPermissions[] = [];
  public rolesAndPermissions: RolPermissions[] = [];
  public routesAndPermissions: Routes[] = [];

  public rolAndPermissionSelected?: RolPermissions;

  public searchControl = new FormControl();

  public listStatus = {
    showModal: false,
  };

  public createArrayByNumber = createArrayByNumber;

  private readonly routesService = inject(RoutesService);
  private readonly rolService = inject(RolService);

  ngOnInit(): void {
    this.getRoutesAndPermissions();
    this.getRolesAndPermissions();

    this.searchControl?.valueChanges
      ?.pipe(debounceTime(300))
      .subscribe(
        (value) =>
          (this.rolesAndPermissionsFilter = arrayFilter(
            this.rolesAndPermissions,
            value,
            ['name']
          ))
      );
  }

  public getRolesAndPermissions(): void {
    this.rolService.getRolesAndPermissions().subscribe({
      next: (rolesAndPermissions) => {
        this.rolesAndPermissionsFilter = rolesAndPermissions;
        this.rolesAndPermissions = rolesAndPermissions;
      },
    });
  }

  private getRoutesAndPermissions(): void {
    this.routesService.getRoutesAndPermissions().subscribe({
      next: (routesAndPermissions) =>
        (this.routesAndPermissions = routesAndPermissions),
    });
  }

  public openModalCreateRol(): void {
    this.listStatus.showModal = true;
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
    this.rolAndPermissionSelected = undefined;
  }
}
