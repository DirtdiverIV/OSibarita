// src/app/shared/components/admin-navbar/admin-navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent implements OnInit {
  userName: string = '';
  isMenuOpen = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Intentar obtener información del usuario actual
    this.authService.getCurrentUserInfo().then(userInfo => {
      if (userInfo && userInfo.nombre) {
        this.userName = userInfo.nombre;
      } else if (userInfo && userInfo.email) {
        this.userName = userInfo.email.split('@')[0]; // Usar parte del email si no hay nombre
      }
    }).catch(error => {
      console.error('Error al obtener información del usuario:', error);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/auth/login']);
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
      });
  }
}