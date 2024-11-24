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

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [
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

  public gridHeaderColumns =
    '10rem 10rem minmax(10rem, 1fr) minmax(10rem, 1fr) 10rem 10rem';
  public nameFilter = '';

  public listStatus = {
    disabledAcceptButton: false,
    loadingTable: true,
    savingUser: false,
    showModal: false,
  };

  public validateLimitText = validateLimitText;
  public validateFormField = validateFormField;

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

    if (this.userLocalService.user?.id_rol === 1) {
      this.gridHeaderColumns += ' minmax(10rem, 1fr)';

      this.getAllCompanies();

      this.userForm.addControl(
        'id_company',
        new FormControl('', [Validators.required])
      );
      this.userForm.addControl(
        'id_rol',
        new FormControl('', [Validators.required])
      );
    }
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group(
      {
        name: new FormControl('', [Validators.required]),
        id_document: new FormControl('', [Validators.required]),
        identification: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );

    this.userForm.get('id_rol')?.valueChanges.subscribe((rol) => {
      if (rol?.id_rol === 4 || rol === 4) {
        this.userForm.get('id_company')?.reset();
        this.userForm.get('id_company')?.disable();
      } else {
        this.userForm.get('id_company')?.enable();
      }
    });
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
          'Lo sentimos, ha ocurrido un error al consultar los empleados',
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
    this.listStatus.disabledAcceptButton = false;
    this.listStatus.showModal = true;
    this.userForm.reset();
  }

  public createUser() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      const user = { ...this.userForm.value } as User;

      this.listStatus.savingUser = true;

      this.userService.createUser(user).subscribe({
        next: (response) => {
          if (response.status) {
            this.getAllUsers();
            this.notificationService.showNotification(
              'Empleado agregado exitosamente',
              'success'
            );
            this.listStatus.showModal = false;
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
            'Lo sentimos, no se pudo crear el empleado',
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

    Object.keys(this.userForm.value).forEach((key) =>
      this.userForm
        .get(key)
        ?.setValue(user[key as keyof typeof user], { emitEvent: false })
    );

    this.userForm.markAllAsTouched();
    this.listStatus.showModal = true;
    this.listStatus.disabledAcceptButton = true;
    this.notificationService.showNotification(
      'Metodo de actualización en desarrollo',
      'success',
      100000
    );
  }
}
