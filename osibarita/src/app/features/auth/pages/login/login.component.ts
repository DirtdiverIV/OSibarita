// src/app/features/auth/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl = '/admin/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Crear formulario de login
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Obtener URL de retorno desde los parámetros de la ruta o usar el valor por defecto
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/admin/dashboard';
    });
  }

  // Getter para facilitar el acceso a los controles del formulario en la plantilla
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const email = this.f['email'].value;
    const password = this.f['password'].value;

    this.authService.login(email, password)
      .then(() => {
        this.router.navigate([this.returnUrl]);
      })
      .catch(error => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
      });
  }

  private getErrorMessage(error: any): string {
    console.error('Error durante el login:', error);
    
    // Manejar mensajes de error específicos
    switch(error.code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      default:
        return 'Ha ocurrido un error al iniciar sesión.';
    }
  }
}