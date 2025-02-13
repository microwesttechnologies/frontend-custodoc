import {
  EventEmitter,
  Component,
  inject,
  Input,
  OnInit,
  Output,
  HostListener,
} from '@angular/core';
import { UserLocalService } from 'src/app/services/local/user.service';
import { SharedModule } from '../shared.module';
import { UserService } from 'src/app/services/external/user.service';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { slideCustomAnimation } from 'src/app/animations/global.animations';
import { homologateText } from 'src/app/globals/homologate-text';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../form/button/button.component';
import { InputComponent } from '../form/input/input.component';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../notification/notification.service';
import { passwordMatchValidator } from 'src/app/services/local/helper.service';
import { DestroyObs } from 'src/app/abstract-classes/destroy.abstract';
import { debounceTime, fromEvent, takeUntil } from 'rxjs';
import { OverlayDirective } from 'src/app/directives/overlay.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    DisabledElementDirective,
    TooltipDirective,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    SharedModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    slideCustomAnimation('slideEnterAndLeaveLeft', 'X', '-1rem', '0', {
      enter: '300ms',
      leave: '300ms',
    }),
    slideCustomAnimation('slideEnterAndLeaveRight', 'X', '1rem', '0', {
      enter: '300ms',
      leave: '300ms',
    }),
  ],
})
export class SidebarComponent extends DestroyObs implements OnInit {
  @Output() isSidebarOpenedChange = new EventEmitter<boolean>();
  @Input() isSidebarOpened = false;

  public passwordForm!: FormGroup;
  public userForm!: FormGroup;

  public showContent = this.isSidebarOpened;
  public isMobile = window.innerWidth <= 768;
  public widthPage = window.innerWidth;

  public listStatus = {
    updatingPassword: false,
    showModalProfile: false,
    updatingUser: false,
  };

  public homologateText = homologateText;

  private readonly notificationService = inject(NotificationService);
  public userLocalService = inject(UserLocalService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    window.addEventListener('storage', (event) => {
      if (event?.key === 'access_token') window.location.reload();
    });

    this.initForm();

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        this.isMobile = window.innerWidth <= 768;
        this.widthPage = window.innerWidth;
      });
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      id_document: new FormControl(''),
      identification: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl('', [Validators.required]),
      id_company: new FormControl(''),
      id_rol: new FormControl(''),
    });

    this.passwordForm = this.formBuilder.group(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  }

  public openAndCloseSidebar(): void {
    this.isSidebarOpened = !this.isSidebarOpened;
    this.isSidebarOpenedChange.emit(this.isSidebarOpened);

    setTimeout(
      () => (this.showContent = this.isSidebarOpened),
      this.isSidebarOpened ? 0 : 300
    );
  }

  public openModalProfile(): void {
    this.listStatus.showModalProfile = true;
    Object.keys(this.userForm.value).forEach((key) =>
      this.userForm
        .get(key)
        ?.setValue(
          this.userLocalService.user[
            key as keyof typeof this.userLocalService.user
          ]
        )
    );
    this.userForm.markAllAsTouched();
  }

  public closeModalProfile(): void {
    this.listStatus.showModalProfile = false;
    this.passwordForm.reset();
    this.userForm.reset();
  }

  public updateUser(): void {
    this.userForm.markAllAsTouched();

    if (this.userForm.valid) {
      this.listStatus.updatingUser = true;
      this.userService.updateUser(this.userForm.value).subscribe({
        next: (response) => {
          if (response.status) {
            this.userLocalService.user.phone = this.userForm.value?.phone;
            this.userLocalService.user.name = this.userForm.value?.name;

            this.notificationService.showNotification(
              'Datos personales actualizados correctamente',
              'success'
            );
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.updatingUser = false;
        },
        error: (error: HttpErrorResponse) => {
          this.listStatus.updatingUser = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo actualizar tus datos personales`,
            'danger'
          );
        },
      });
    }
  }

  public updatePassword(): void {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.valid) {
      this.listStatus.updatingPassword = true;
      this.userService
        .updatePassword(this.passwordForm.value?.password)
        .subscribe({
          next: (response) => {
            if (response.status) {
              this.notificationService.showNotification(
                'Contraseña actualizada correctamente',
                'success'
              );
              this.passwordForm.reset();
            } else {
              this.notificationService.showNotification(
                response.message!,
                'danger'
              );
            }
            this.listStatus.updatingPassword = false;
          },
          error: (error: HttpErrorResponse) => {
            this.listStatus.updatingPassword = false;
            this.notificationService.showNotification(
              `Lo sentimos, no se pudo actualizar tu contraseña`,
              'danger'
            );
          },
        });
    }
  }

  public logout(): void {
    this.userService.logout().subscribe({
      next: (response) => {
        if (response.status) {
          window.localStorage.removeItem('access_token');
          window.location.reload();
        }
      },
    });
  }
}
