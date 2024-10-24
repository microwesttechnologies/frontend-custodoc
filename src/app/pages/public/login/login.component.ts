import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UserService } from 'src/app/services/external/user.service';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
  ],
  providers: [],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  messageError: string = '';

  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.userService.login(username, password).subscribe({
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
