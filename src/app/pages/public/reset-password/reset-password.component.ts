import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { slideCustomAnimation } from 'src/app/animations/global.animations';
import { UserService } from 'src/app/services/external/user.service';
import { passwordMatchValidator } from 'src/app/services/local/helper.service';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [SharedModule, InputComponent, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  animations: [
    slideCustomAnimation('slideEnterTop', 'Y', '-1rem', '0', {
      enter: '300ms',
    }),
    slideCustomAnimation('slideEnterRight', 'X', '1rem', '0', {
      enter: '300ms',
    }),
    slideCustomAnimation('slideLeaveLeft', 'X', '-1rem', '0', {
      leave: '300ms',
    }),
  ],
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm!: FormGroup;
  public listStatus = {
    isTokenExpiredOrInvalid: false,
    loadingValidationToken: true,
    loadingResetPassword: false,
    passwordChanged: false,
  };

  private token?: string;

  private readonly notificationService = inject(NotificationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  public router = inject(Router);

  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );

    this.token = this.activatedRoute.snapshot.queryParams['token'];

    if (this.token) {
      this.validateIfTokenIsValid();
    } else {
      this.listStatus.isTokenExpiredOrInvalid = true;
      this.listStatus.loadingValidationToken = false;
    }
  }

  private validateIfTokenIsValid(): void {
    this.userService.validateIfTokenIsValid(this.token!).subscribe({
      next: () => {
        this.listStatus.loadingValidationToken = false;
      },
      error: () => {
        this.listStatus.isTokenExpiredOrInvalid = true;
        this.listStatus.loadingValidationToken = false;
      },
    });
  }

  public resetPassword(): void {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.valid && !this.listStatus.loadingResetPassword) {
      this.listStatus.loadingResetPassword = true;
      this.userService
        .resetPassword(
          this.resetPasswordForm.get('password')?.value,
          this.token!
        )
        .subscribe({
          next: (response) => {
            this.listStatus.passwordChanged = response.status;
            if (!response.status) {
              this.listStatus.isTokenExpiredOrInvalid = true;
              this.notificationService.showNotification(
                response.message!,
                'danger'
              );
            }
          },
          error: (error: HttpErrorResponse) => {
            this.listStatus.isTokenExpiredOrInvalid = true;
            this.listStatus.loadingResetPassword = false;
            this.notificationService.showNotification(
              'Lo sentimos, el token ha expirado',
              'danger'
            );
          },
        });
    }
  }
}
