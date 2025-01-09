import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/external/user.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { regex } from 'src/app/regex';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { slideCustomAnimation } from 'src/app/animations/global.animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    InputComponent,
    ButtonComponent,
    ModalComponent,
    TooltipDirective,
  ],
  animations: [
    slideCustomAnimation('slideEnterTop', 'Y', '-1rem', '0', {
      enter: '300ms',
    }),
    slideCustomAnimation('slideLeaveLeft', 'X', '-1rem', '0', {
      leave: '300ms',
    }),
    slideCustomAnimation('slideEnterRight', 'X', '100%', '0', {
      enter: '300ms',
    }),
  ],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public emailControl = new FormControl(
    '',
    Validators.compose([
      Validators.required,
      Validators.email,
      Validators.pattern(regex.email),
    ])
  );
  public messageError: string = '';

  public listStatus = {
    showModalPasswordReset: false,
    loadingLogin: false,
    sendingEmail: false,
    emailSent: false,
  };

  private readonly notificationService = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.pattern(regex.email),
        ]),
      ],
      password: ['', Validators.required],
    });
  }

  public login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid && !this.listStatus.loadingLogin) {
      this.listStatus.loadingLogin = true;
      this.messageError = '';
      const { email, password } = this.loginForm.value;

      this.userService.login(email, password).subscribe({
        next: (response) => {
          this.listStatus.loadingLogin = false;
          if (response.status) {
            window.localStorage.setItem('access_token', `${response.token}`);
            window.location.reload();
          } else {
            this.messageError = response.message!;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.listStatus.loadingLogin = false;
          this.messageError = error.message;
        },
      });
    }
  }

  public sendLinkResetPassword(): void {
    this.emailControl.markAsTouched();
    if (this.emailControl.valid) {
      this.notificationService.hideNotification();
      this.listStatus.sendingEmail = true;
      this.userService
        .sendLinkResetPassword(this.emailControl.value!)
        .subscribe({
          next: (response) => {
            this.listStatus.sendingEmail = false;
            this.notificationService.showNotification(
              response.message!,
              response.status ? 'success' : 'danger',
              10000
            );
            this.listStatus.emailSent = response.status;
          },
          error: (error: HttpErrorResponse) => {
            this.listStatus.sendingEmail = false;
            this.notificationService.showNotification(
              'Lo sentimos, ha ocurrido un error',
              'danger',
              10000
            );
          },
        });
    }
  }

  public closeModalResetPassword(): void {
    this.listStatus.showModalPasswordReset = false;
    this.notificationService.hideNotification();
    this.listStatus.emailSent = false;
    this.emailControl.reset();
  }
}
