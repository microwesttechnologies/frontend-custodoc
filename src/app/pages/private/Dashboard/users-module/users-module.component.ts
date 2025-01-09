import { UserLocalService } from 'src/app/services/local/user.service';
import { Component, inject } from '@angular/core';
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
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ModalConfirmationDeleteComponent } from 'src/app/shared-components/modal-confirmation-delete/modal-confirmation-delete.component';

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [
    ModalConfirmationDeleteComponent,
    DisabledElementDirective,
    AutoCompleteComponent,
    TooltipDirective,
    NavbarComponent,
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
  public typesDocument: TypesDocument[] = [];
  public companies: Company[] = [];
  public users: User[] = [];

  public roles: Rol[] = [
    { id_rol: 2, name: 'Administrador' },
    { id_rol: 3, name: 'Médico' },
    { id_rol: 4, name: 'Cargador de archivos' },
  ];

  public idUserSelected?: string;
  public userForm!: FormGroup;
  public userToDelete?: User;

  public gridHeaderColumns =
    '10rem 10rem minmax(10rem, 1fr) minmax(10rem, 1fr) 10rem 10rem';

  public textFilter = '';
  public fieldsToFilter = ['email', 'name', 'name_type_document', 'name_rol', 'phone', 'identification', 'name_company'];

  public listStatus = {
    loadingTable: true,
    savingUser: false,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;
  public homologateText = homologateText;

  private readonly typesDocumentService = inject(TypesDocumentService);
  private readonly notificationService = inject(NotificationService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  public userLocalService = inject(UserLocalService);

  ngOnInit(): void {
    this.initForm();

    this.getAllTypesDocument();
    this.getAllUsers();
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group(
      {
        name: new FormControl('', [Validators.required]),
        id_document: new FormControl('', [Validators.required]),
        identification: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required]),
        password: new FormControl(''),
        confirmPassword: new FormControl(''),
      },
    );

    if (this.userLocalService.user?.id_rol === 1) {
      this.gridHeaderColumns += ' minmax(10rem, 1fr) 2.8rem';

      this.getAllCompanies();

      this.userForm.addControl(
        'id_company',
        new FormControl('', [Validators.required])
      );
      this.userForm.addControl(
        'id_rol',
        new FormControl('', [Validators.required])
      );
    } else if (this.userLocalService.user?.id_rol === 2) {
      this.gridHeaderColumns += ' 2.8rem';
    }

    this.userForm.get('id_rol')?.valueChanges.subscribe((rol) => {
      if (+rol === 4) {
        this.userForm.get('id_company')?.reset();
        this.userForm.get('id_company')?.clearValidators();
      } else {
        this.userForm.get('id_company')?.setValidators([Validators.required]);
      }
      this.userForm.get('id_company')?.updateValueAndValidity();
    });
  }

  private setFormMode(isCreating: boolean): void {
    if (isCreating) {
      // Agregar validadores para creación
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.userForm.setValidators(passwordMatchValidator('password', 'confirmPassword'));
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
          return user;
        });
        this.listStatus.loadingTable = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(
          `Lo sentimos, ha ocurrido un error al consultar los ${homologateText(this.userLocalService?.user?.type_company!, 'empleados')}`,
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

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
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

  public openModalCreateUser() {
    this.listStatus.showModal = true;
    this.setFormMode(true);
    this.userForm.reset();
  }

  public createOrUpdateUser() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      const user = { ...this.userForm.value } as User;

      this.listStatus.savingUser = true;

      const endpointToExecute = this.idUserSelected
        ? this.userService.updateUser(user)
        : this.userService.createUser(user);

      endpointToExecute.subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllUsers();
            this.notificationService.showNotification(
              `${homologateText(this.userLocalService?.user?.type_company!, 'empleado')} ${this.idUserSelected ? 'actualizado' : 'agregado'
              } exitosamente`,
              'success'
            );
            this.closeModal();
            if (!this.idUserSelected)
              this.globalService.detailCompany.users.amount =
                this.globalService.detailCompany.users.amount + 1;

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
            `Lo sentimos, no se pudo ${this.idUserSelected ? 'actualizar' : 'agregar'
            } el ${homologateText(this.userLocalService?.user?.type_company!, 'empleado')}`,
            'danger'
          );
        },
      });
    }
  }

  public closeModal(): void {
    this.listStatus.showModal = false;
    this.idUserSelected = undefined;
  }

  public setUpdateUser(user: User) {
    this.idUserSelected = user.identification;
    this.setFormMode(false);

    Object.keys(this.userForm.value).forEach((key) =>
      this.userForm
        .get(key)
        ?.setValue(user[key as keyof typeof user], { emitEvent: false })
    );

    this.userForm.markAllAsTouched();
    this.listStatus.showModal = true;
  }

  public deleteUser(): void {
    this.userService.deleteUser(this.userToDelete?.identification!).subscribe({
      next: (response) => {
        if (response.status) {
          this.notificationService.showNotification(`${homologateText(this.userLocalService?.user?.type_company!, 'empleado')} eliminado exitosamente`, 'success');
          this.users = this.users.filter(user => user.identification !== this.userToDelete?.identification);
          this.globalService.detailCompany.users.amount = this.users.length;
          this.userToDelete = undefined;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification(`Lo sentimos, no se pudo eliminar el ${homologateText(this.userLocalService?.user?.type_company!, 'empleado')}`, 'danger');
      }
    })
  }

}
