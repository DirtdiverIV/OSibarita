// src/app/core/services/app-initializer.service.ts
import { Injectable } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  constructor(private mockDataService: MockDataService) {}

  // Esta función será llamada durante la inicialización de la aplicación
  async initializeApp(): Promise<void> {
    try {
      // Inicializar datos mock en Firestore solo en desarrollo o si está habilitado
      if (environment.mockData) {
        console.log('Inicializando datos mockup...');
        await this.mockDataService.initializeMockData();
        console.log('Datos mockup inicializados correctamente');
      }
      
      console.log('Aplicación inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
    }
  }
}