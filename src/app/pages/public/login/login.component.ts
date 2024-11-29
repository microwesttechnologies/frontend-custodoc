import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/external/user.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { regex } from 'src/app/regex';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [SharedModule, InputComponent, ButtonComponent],
  providers: [],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public messageError: string = '';

  public listStatus = {
    loadingLogin: false,
  };

  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
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

  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
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
}
