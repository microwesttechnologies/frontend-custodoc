import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GetUserAuthUseCase } from 'Core/Domain/UseCase/GetUserAuthUseCase';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  userRole: string = "";
  userName: string = "";

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
        (response: { isAuthenticated: boolean, role: string, name: string }) => {
          if (response.isAuthenticated) {
            this.userRole = response.role;
            this.userName = response.name;
            localStorage.setItem('userRole', this.userRole);
            localStorage.setItem('userName', this.userName);
            if (this.userRole === "medico" || this.userRole === "cargue" ) {
              this.router.navigate(['/history']);
            } else {
              this.router.navigate(['/company']);
              
            }
            console.log(this.userRole, this.userName);
          } else {
            this.messageError = "Credenciales incorrectas";
          }
        },
        (error: any) => {
          console.error('Error de autenticación', error);
          this.messageError = "Error en el servidor";
        }
      );
    }
  }
}
