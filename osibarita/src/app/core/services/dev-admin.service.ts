// src/app/core/services/dev-admin.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class DevAdminService {

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {}

  /**
   * Crea un administrador de prueba si estamos en entorno de desarrollo
   */
  async setupDevAdmin(): Promise<void> {
    // Solo ejecutar en entorno de desarrollo y si está habilitado el mockData
    if (!environment.production && environment.mockData) {
      const testEmail = 'admin@test.com';
      const testPassword = 'Admin123!';
      
      try {
        // Intentar iniciar sesión con el usuario de prueba
        await this.authService.login(testEmail, testPassword);
        console.log('Sesión iniciada automáticamente con usuario de prueba en modo desarrollo');
      } catch (error: any) {
        // Si el usuario no existe, crearlo
        if (error.code === 'auth/user-not-found') {
          try {
            console.log('Creando usuario administrador de prueba...');
            await this.authService.register(testEmail, testPassword, 'Administrador de Prueba');
            console.log('Usuario de prueba creado correctamente');
          } catch (registerError) {
            console.error('Error al crear usuario de prueba:', registerError);
          }
        } else {
          console.error('Error al iniciar sesión con usuario de prueba:', error);
        }
      }
    }
  }
}