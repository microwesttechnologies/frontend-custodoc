import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { GetUserAuthUseCase } from 'Core/Domain/UseCase/GetUserAuthUseCase';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule],
  providers: [GetUserAuthUseCase] 
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  messageError: string = "";

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: GetUserAuthUseCase 
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe(
        (isAuthenticated: any) => {
          if (isAuthenticated) {
            this.router.navigate(['/dashboard']);
          } else {
            this.messageError="Credenciales incorrectas"
          }
        },
        (error: any) => {
          console.error('Error de autenticación', error);
        }
      );
    }
  }
}
