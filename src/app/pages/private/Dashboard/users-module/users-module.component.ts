import { UserLocalService } from 'src/app/services/local/user.service';
import { Component, inject, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { CardComponent } from 'src/app/shared-components/card/card.component';
import { TableComponent } from 'src/app/shared-components/table/table.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { ListFields } from 'src/app/models/modal.model';
import { TypesDocumentService } from 'src/app/services/external/types-document.service';
import { UserService } from 'src/app/services/external/user.service';
import { CompanyService } from 'src/app/services/external/company.service';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { Company } from 'src/app/models/company.model';
import { TypesDocument } from 'src/app/models/types-document.model';
import { Rol } from 'src/app/models/rol.model';
import { GlobalService } from 'src/app/services/external/global.service';

@Component({
  selector: 'app-users-module',
  standalone: true,
  imports: [
    AvatarModule,
    CardComponent,
    SharedModule,
    TableComponent,
    ButtonModule,
    ModalComponent,
  ],
  templateUrl: './users-module.component.html',
  styleUrl: './users-module.component.scss',
})
export class UsersModuleComponent {
  @Input() labelBtn: string = '';
  @Input() routerBtn: string = '';
  @Input() showForm: boolean = false;

  itemsTable: any[] = [];
  nameTable: string = '';
  titleModal: string = '';
  descriptionModal: string = '';
  listFields!: ListFields;
  modalVisible = false;

  private readonly typesDocumentService = inject(TypesDocumentService);
  private readonly userLocalService = inject(UserLocalService);
  private readonly companyService = inject(CompanyService);
  private readonly globalService = inject(GlobalService);
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    this.titleModal = 'Crear usuario';
    this.descriptionModal = 'En este modulo podras crear usuarios';

    this.listFields = {
      name: {
        label: 'Nombre',
        required: true,
      },
      id_document: {
        label: 'Tipo de documento',
        keyAutoComplete: 'name',
        required: true,
        type: 'select',
      },
      identification: {
        label: 'Numero de documento',
        required: true,
      },
      phone: {
        label: 'Numero telefonico',
        required: true,
      },
      email: {
        label: 'Correo electronico',
        required: true,
      },
      password: {
        label: 'Contraseña',
        type: 'password',
        required: true,
      },
      id_rol: {
        label: 'Rol',
        required: true,
        keyAutoComplete: 'name',
        type: 'select',
        data: [{ id_rol: 3, name: 'Empleado' }],
      },
    };

    if (this.userLocalService.user?.id_rol === 1) {
      this.listFields = {
        ...this.listFields,
        id_company: {
          required: true,
          keyAutoComplete: 'name',
          type: 'autocomplete',
          label: 'Compañia',
        },
      };

      this.listFields['id_rol'].data?.unshift({
        id_rol: 2,
        name: 'Administrador',
      });

      this.getAllCompanies();
    }

    this.nameTable = 'Usuarios';
    this.labelBtn = 'Crear usuarios';

    this.getAllTypesDocument();
    this.getAllUsers();
  }

  private getAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.itemsTable = [
          ...users.map((customer) => {
            let dataTable: any = {
              Identificación: customer.identification,
              'Tipo documento': customer.name_type_document,
              Nombre: customer.name,
              Email: customer.email,
              Telefono: customer.phone,
            };

            if (this.userLocalService.user.id_rol === 1) {
              dataTable = {
                ...dataTable,
                Compañia: customer.name_company,
              };
            }

            return dataTable;
          }),
        ];

        this.globalService.detailCompany.users.amount = users.length;
      },
    });
  }

  private getAllTypesDocument(): void {
    this.typesDocumentService.getAllTypesDocument().subscribe({
      next: (response) => {
        this.listFields['id_document'].data = response;
      },
    });
  }

  private getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (companies) => {
        this.listFields['id_company'].data = companies;
        this.listFields['id_company'].dataFilter = companies;
      },
    });
  }

  public createUser(userForm: FormGroup) {
    const user = { ...userForm.value } as User;
    if (this.userLocalService.user.id_rol === 1) {
      user.id_company = (user.id_company as Company).id_company;
    }
    user.id_document = (user.id_document as TypesDocument).id_document;
    user.id_rol = (user.id_rol as Rol).id_rol;

    this.userService.createUser(user).subscribe({
      next: (response) => {
        if (response.status) {
          this.modalVisible = false;
          this.getAllUsers();
        }
      },
      error: (error) => {},
    });
  }
}
