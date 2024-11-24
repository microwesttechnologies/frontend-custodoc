import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/external/user.service';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [InputComponent, SharedModule],
  providers: [],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  messageError: string = '';

  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.messageError = '';
      const { email, password } = this.loginForm.value;

      this.userService.login(email, password).subscribe({
        next: (response) => {
          if (response.status) {
            window.localStorage.setItem('access_token', `${response.token}`);
            window.location.reload();
          } else {
            this.messageError = response.message!;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.messageError = error.message;
        },
      });
    }
  }
}
