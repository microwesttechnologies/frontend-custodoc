import { UserLocalService } from 'src/app/services/local/user.service';
import { Component, HostBinding, inject } from '@angular/core';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { TypesDocumentService } from 'src/app/services/external/types-document.service';
import { UserService } from 'src/app/services/external/user.service';
import { CompanyService } from 'src/app/services/external/company.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { Company } from 'src/app/models/company.model';
import { TypesDocument } from 'src/app/models/types-document.model';
import { Rol } from 'src/app/models/rol.model';
import { GlobalService } from 'src/app/services/external/global.service';
import { NavbarComponent } from 'src/app/shared-components/navbar/navbar.component';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { SelectComponent } from 'src/app/shared-components/form/select/select.component';
import { AutoCompleteComponent } from 'src/app/shared-components/form/autocomplete/autocomplete.component';
import {
  passwordMatchValidator,
  validateFormField,
  validateLimitText,
} from 'src/app/services/local/helper.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { homologateText } from 'src/app/globals/homologate-text';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';
import { ActivatedRoute } from '@angular/router';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { RolService } from 'src/app/services/external/rol.service';
import { ModalCreateAndUpdateAreaComponent } from './modal-create-and-update-area/modal-create-and-update-area.component';
import { Area } from 'src/app/models/area.model';
import { AreaService } from 'src/app/services/external/area.service';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [
    ModalCreateAndUpdateAreaComponent,
    ModalConfirmationDeleteComponent,
    DisabledByPermissionDirective,
    AutoCompleteComponent,
    TooltipDirective,
    NavbarComponent,
    ButtonComponent,
    SelectComponent,
    ModalComponent,
    InputComponent,
    TableComponent,
    SharedModule,
  ],
  templateUrl: './users-module.component.html',
  styleUrl: './users-module.component.scss',
})
export class UsersModuleComponent {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  public typesDocument: TypesDocument[] = [];
  public companies: Company[] = [];
  public areas: Area[] = [];
  public users: User[] = [];
  public roles: Rol[] = [];

  public identificationByUrl?: number;
  public idUserSelected?: string;
  public userForm!: FormGroup;
  public userToDelete?: User;

  public withDeletePermission = false;

  public gridHeaderColumns =
    '10rem 10rem minmax(10rem, 1fr) minmax(10rem, 1fr) 10rem 10rem';

  public searchControl = new FormControl();
  public fieldsToFilter = [
    'name_type_document',
    'identification',
    'name_company',
    'name_rol',
    'email',
    'phone',
    'name',
  ];

  public listStatus = {
    showModalArea: false,
    loadingTable: true,
    savingArea: false,
    savingUser: false,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;
  public homologateText = homologateText;

  private readonly typesDocumentService = inject(TypesDocumentService);
  private readonly notificationService = inject(NotificationService);
  private readonly companyService = inject(CompanyService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly globalService = inject(GlobalService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  public userLocalService = inject(UserLocalService);
  private readonly areaService = inject(AreaService);
  private readonly rolService = inject(RolService);

  ngOnInit(): void {
    this.identificationByUrl =
      +this.activatedRoute.snapshot.queryParams['identification'];
    this.initForm();

    this.getAllTypesDocument();
    this.getAllUsers();
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      id_document: new FormControl('', [Validators.required]),
      id_rol: new FormControl('', [Validators.required]),
      identification: new FormControl('', [
        Validators.required,
        Validators.maxLength(20),
      ]),
      email: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
    });

    if (this.userLocalService.user?.id_rol === 1) {
      this.gridHeaderColumns += ' minmax(10rem, 1fr)';

      this.getAllCompanies();

      this.userForm.addControl(
        'id_company',
        new FormControl('', [Validators.required])
      );
    }

    this.withDeletePermission = !!this.userLocalService?.menuSidebar?.find(
      (module) => module.code === 'USER' && module.DELETE
    );

    if (this.userLocalService?.user?.id_company)
      this.getRolesByCompany(
        this.userLocalService?.user?.type_company === 'IPS'
          ? null
          : this.userLocalService?.user?.id_company
      );

    if (this.userLocalService?.user?.type_company === 'Otras')
      this.addAreaControl();

    if (
      this.userLocalService?.user?.type_company === 'Otras' ||
      this.userLocalService?.user?.id_rol === 1
    )
      this.gridHeaderColumns += ' 10rem';

    if (this.withDeletePermission) this.gridHeaderColumns += ' 1.9rem';
  }

  private addAreaControl(id_company?: number, id_area?: number): void {
    this.getAllAreas(id_company);
    this.userForm.addControl(
      'id_area',
      new FormControl(id_area, [Validators.required])
    );
  }

  private setFormMode(isCreating: boolean): void {
    if (isCreating) {
      // Agregar validadores para creación
      this.userForm
        .get('password')
        ?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm
        .get('confirmPassword')
        ?.setValidators([Validators.required]);
      this.userForm.setValidators(
        passwordMatchValidator('password', 'confirmPassword')
      );
    } else {
      // Remover validadores para actualización
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.clearValidators(); // Si tienes validadores a nivel de formulario
    }

    // Actualizar estado de validadores
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    this.userForm.updateValueAndValidity();
  }

  private getAllUsers(): void {
    this.listStatus.loadingTable = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map((user) => {
          user.disabled =
            user.identification === this.userLocalService.user?.identification;
          user.id_company = user.id_company ?? 'IPS';
          return user;
        });

        if (
          this.identificationByUrl ===
          this.userLocalService.user?.identification
        ) {
          this.identificationByUrl = undefined;
        } else if (this.identificationByUrl) {
          const user = this.users.find(
            (user) => user.identification === this.identificationByUrl
          );
          if (user) {
            this.setUpdateUser(user);
          } else {
            this.notificationService.showNotification(
              `Lo sentimos, el ${homologateText(
                this.userLocalService?.user?.type_company!,
                'empleado'
              )} no existe`,
              'danger'
            );
          }
          this.identificationByUrl = undefined;
        }

        this.listStatus.loadingTable = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar los ${homologateText(
            this.userLocalService?.user?.type_company!,
            'empleados'
          )}`,
          'danger',
          10000
        );
        this.listStatus.loadingTable = false;
      },
    });
  }

  private getAllTypesDocument(): void {
    this.typesDocumentService.getAllTypesDocument().subscribe({
      next: (typesDocument) => {
        this.typesDocument = typesDocument;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar los tipos de documento',
          'danger',
          10000
        );
      },
    });
  }

  public getRolesByCompany(id_company?: any): void {
    if (id_company === 'IPS' && this.userLocalService?.user?.id_rol === 1) {
      this.roles = [
        {
          name: 'Cargador de archivos',
          id_rol: 4,
        },
      ];
    } else {
      this.rolService
        .getRolesByCompany(id_company === 'null' ? undefined : id_company)
        .subscribe({
          next: (roles) => (this.roles = roles),
        });
    }
  }

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.companies.unshift({
          name: 'Custodocs',
          id_company: 'IPS',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar las compañias',
          'danger',
          10000
        );
      },
    });
  }

  private getAllAreas(id_company?: number): void {
    this.areaService.getAllAreas(id_company).subscribe({
      next: (areas) => (this.areas = areas),
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          'Lo sentimos, ha ocurrido un error al consultar las areas',
          'danger',
          10000
        );
      },
    });
  }

  public changeCompany(company: Company): void {
    this.userForm.get('id_rol')?.reset();
    this.getRolesByCompany(company.type === 'IPS' ? null : company.id_company);
    if (company.type === 'Otras')
      this.addAreaControl(company.id_company as number);
    else this.userForm.removeControl('id_area');
  }

  public openModalCreateUser() {
    this.listStatus.showModal = true;
    this.setFormMode(true);
    this.userForm.reset();

    if (this.userLocalService?.user?.type_company !== 'Otras')
      this.userForm.removeControl('id_area');
  }

  public createOrUpdateUser() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      const user = { ...this.userForm.value } as User;

      this.listStatus.savingUser = true;

      user.id_company = user.id_company === 'null' ? null : user.id_company;

      const endpointToExecute = this.idUserSelected
        ? this.userService.updateUser(user)
        : this.userService.createUser(user);

      endpointToExecute.subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllUsers();
            this.notificationService.showNotification(
              `${homologateText(
                this.userLocalService?.user?.type_company!,
                'empleado'
              )} ${
                this.idUserSelected ? 'actualizado' : 'agregado'
              } exitosamente`,
              'success'
            );
            this.closeModal();
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.savingUser = false;
        },
        error: (error) => {
          this.listStatus.savingUser = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              this.idUserSelected ? 'actualizar' : 'agregar'
            } el ${homologateText(
              this.userLocalService?.user?.type_company!,
              'empleado'
            )}`,
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
    this.idUserSelected = undefined;

    if (this.userLocalService.user?.id_rol === 1) this.roles = [];
  }

  public setUpdateUser(user: User) {
    this.idUserSelected = user.identification;
    this.setFormMode(false);

    Object.keys(this.userForm.value).forEach((key) =>
      this.userForm
        .get(key)
        ?.setValue(user[key as keyof typeof user], { emitEvent: false })
    );

    if (this.userLocalService?.user?.id_rol === 1) {
      this.getRolesByCompany(
        user.type_company === 'IPS' ? null : user.id_company
      );
      if (user.type_company === 'Otras') {
        this.addAreaControl(user.id_company, user.id_area);
      } else {
        this.userForm.removeControl('id_area');
      }
    }

    this.userForm.markAllAsTouched();
    this.listStatus.showModal = true;
  }

  public deleteUser(): void {
    this.userService.deleteUser(this.userToDelete?.identification!).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(
            `${homologateText(
              this.userLocalService?.user?.type_company!,
              'empleado'
            )} eliminado exitosamente`,
            'success'
          );
          this.users = this.users.filter(
            (user) => user.identification !== this.userToDelete?.identification
          );
          // this.globalService.detailCompany.users.amount = this.users.length;
          this.userToDelete = undefined;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, no se pudo eliminar el ${homologateText(
            this.userLocalService?.user?.type_company!,
            'empleado'
          )}`,
          'danger'
        );
      },
    });
  }
}
