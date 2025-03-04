// src/app/core/services/app-initializer.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  constructor() {}

  // Esta función será llamada durante la inicialización de la aplicación
  async initializeApp(): Promise<void> {
    try {
      // Ya no inicializamos datos mock
      console.log('Aplicación inicializada correctamente (sin carga de datos mock)');
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
    }
  }
}