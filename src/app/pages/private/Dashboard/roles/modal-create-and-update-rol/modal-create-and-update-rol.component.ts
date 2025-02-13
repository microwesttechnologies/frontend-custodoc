import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { fadeInCustomAnimation } from 'src/app/animations/global.animations';
import { Routes } from 'src/app/models/routes.model';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { RoutesAndPermissionsForm } from 'src/app/models/routes.model';
import { RolPermissions } from 'src/app/models/rol.model';
import { PermissionsKeys } from 'src/app/models/permissions.model';
import { RolService } from 'src/app/services/external/rol.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';

@Component({
  selector: 'app-modal-create-and-update-rol',
  standalone: true,
  imports: [
    DisabledElementDirective,
    ModalComponent,
    InputComponent,
    TableComponent,
    SharedModule,
  ],
  templateUrl: './modal-create-and-update-rol.component.html',
  styleUrl: './modal-create-and-update-rol.component.scss',
  animations: [fadeInCustomAnimation('fadeInOut', '300ms', '300ms')],
})
export class ModalCreateAndUpdateRolComponent implements OnInit {
  @Output() eventCloseModal = new EventEmitter<void>();
  @Output() eventRefresh = new EventEmitter<void>();

  @Input() rolAndPermissionSelected?: RolPermissions;
  @Input() routesAndPermissions!: Routes[];

  public routesAndPermissionsForm: RoutesAndPermissionsForm[] = [];
  public nameControl!: FormControl;
  public listPermissions: PermissionsKeys[] = [
    'ACCESS',
    'CREATE',
    'UPDATE',
    'DELETE',
    'EXPORT',
  ];

  public listStatus = {
    savingRol: false,
  };

  private readonly notificationService = inject(NotificationService);
  private readonly rolService = inject(RolService);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.nameControl = new FormControl(
      this.rolAndPermissionSelected?.name ?? '',
      [Validators.required]
    );

    if (this.rolAndPermissionSelected?.name) this.nameControl.markAsTouched();

    this.routesAndPermissionsForm = this.routesAndPermissions.map((route) => {
      const routeByPreviousSelection =
        this.rolAndPermissionSelected?.modules?.find(
          (m) => m.code === route.code
        );

      return {
        id_route: route.id_route,
        name: route.name,
        code: route.code,
        permissions: {
          ACCESS: routeByPreviousSelection?.ACCESS ?? 0,
          ...this.listPermissions.slice(1).reduce((acc, permission) => {
            if (route[permission as keyof typeof route]) {
              acc[permission] =
                routeByPreviousSelection?.[
                  permission as keyof typeof routeByPreviousSelection
                ] ?? 0;
            }
            return acc;
          }, {} as any),
        },
      };
    });
  }

  public actionCheckbox(permission: PermissionsKeys, index: number): void {
    const permissionsRoute = this.routesAndPermissionsForm[index].permissions;

    permissionsRoute[permission] = permissionsRoute[permission] ? 0 : 1;

    if (permission === 'ACCESS' && !permissionsRoute[permission]) {
      Object.keys(permissionsRoute).forEach(
        (key) => (permissionsRoute[key as keyof typeof permissionsRoute] = 0)
      );
    }
  }

  public createOrUpdateRol(): void {
    this.listStatus.savingRol = true;
    const body = {
      id_rol: this.rolAndPermissionSelected?.id_rol,
      name: this.nameControl.value,
      modules: this.routesAndPermissionsForm,
    };

    const endpointToExecute = !!this.rolAndPermissionSelected
      ? this.rolService.updateRol(body)
      : this.rolService.createRol(body);

    endpointToExecute.subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            response.message!,
            'success'
          );
          this.eventCloseModal.emit();
          this.eventRefresh.emit();
        }
        this.listStatus.savingRol = false;
      },
      error: () => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo crear el rol`,
          'danger'
        );
        this.listStatus.savingRol = false;
      },
    });
  }
}
