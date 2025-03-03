// src/app/features/vistas/pages/diagnostico/diagnostico.component.ts
import { Component, OnInit } from '@angular/core';
import { FirebaseDiagnosticService } from '../../../../core/services/firebase-diagnostic.service';
import { MockDataService } from '../../../../core/services/mock-data.service';

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.component.html',
  styleUrls: ['./diagnostico.component.scss']
})
export class DiagnosticoComponent implements OnInit {
  connectionStatus = false;
  collectionsData: any = null;
  loading = false;
  errorMessage = '';
  mockDataInitialized = false;
  menuDiaInitialized = false;

  constructor(
    private firebaseDiagnosticService: FirebaseDiagnosticService,
    private mockDataService: MockDataService
  ) { }

  ngOnInit(): void {
    this.testConnection();
  }

  async testConnection() {
    this.loading = true;
    try {
      this.connectionStatus = await this.firebaseDiagnosticService.testFirebaseConnection();
      if (this.connectionStatus) {
        this.checkCollections();
      }
    } catch (error) {
      console.error('Error al comprobar conexión:', error);
      this.errorMessage = 'Error al comprobar conexión: ' + error;
    } finally {
      this.loading = false;
    }
  }

  async resetMenuDia() {
    this.loading = true;
    try {
      await this.mockDataService.resetMenuDia();
      this.menuDiaInitialized = true;
      // Volver a comprobar colecciones después de inicializar datos
      await this.checkCollections();
    } catch (error) {
      console.error('Error al reinicializar el menú del día:', error);
      this.errorMessage = 'Error al reinicializar el menú del día: ' + error;
    } finally {
      this.loading = false;
    }
  }

  async checkCollections() {
    this.loading = true;
    try {
      this.collectionsData = await this.firebaseDiagnosticService.checkCollections();
    } catch (error) {
      console.error('Error al comprobar colecciones:', error);
      this.errorMessage = 'Error al comprobar colecciones: ' + error;
    } finally {
      this.loading = false;
    }
  }

  

  async initializeMockData() {
    this.loading = true;
    try {
      await this.mockDataService.initializeMockData();
      this.mockDataInitialized = true;
      // Volver a comprobar colecciones después de inicializar datos
      await this.checkCollections();
    } catch (error) {
      console.error('Error al inicializar datos mock:', error);
      this.errorMessage = 'Error al inicializar datos mock: ' + error;
    } finally {
      this.loading = false;
    }
  }
}