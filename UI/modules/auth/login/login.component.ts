import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
   
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      // Aquí debes añadir la lógica de autenticación
      // Por ejemplo, podrías llamar a un servicio de autenticación:

      // this.authService.login(username, password).subscribe(
      //   (response) => {
      //     // Redirigir al usuario a la página deseada
      //     this.router.navigate(['/dashboard']);
      //   },
      //   (error) => {
      //     // Manejar el error
      //     console.error('Error de autenticación', error);
      //   }
      // );

      // Para la demostración, simplemente redirigimos a /dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
