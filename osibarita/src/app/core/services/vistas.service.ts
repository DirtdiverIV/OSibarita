// src/app/core/services/vistas.service.ts
import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Vista, ConfiguracionTV, MenuItem, Escena } from '../../models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VistasService {

  constructor(private firestoreService: FirestoreService) { }

  // Obtener todas las vistas
  getVistas(): Observable<Vista[]> {
    return this.firestoreService.getCollection<Vista>('vistas')
      .pipe(tap(vistas => console.log('Vistas cargadas:', vistas)));
  }

  // Obtener configuración de una TV específica
  getConfiguracionTV(tvId: string): Observable<ConfiguracionTV> {
    return this.firestoreService.getDocObservable<ConfiguracionTV>('configuracion', tvId)
      .pipe(tap(config => console.log(`Configuración para ${tvId}:`, config)));
  }

  // Actualizar configuración de una TV
  async updateConfiguracionTV(tvId: string, config: Partial<ConfiguracionTV>): Promise<void> {
    const updatedConfig = {
      ...config,
      ultimaActualizacion: new Date()
    };
    return this.firestoreService.updateDoc('configuracion', tvId, updatedConfig);
  }

  // Obtener tapas del día
  getTapas(): Observable<MenuItem[]> {
    return this.firestoreService.getCollection<MenuItem>('vistas/dia/tapas')
      .pipe(tap(tapas => console.log('Tapas cargadas:', tapas)));
  }

  // Obtener raciones del día
  getRaciones(): Observable<MenuItem[]> {
    return this.firestoreService.getCollection<MenuItem>('vistas/dia/raciones')
      .pipe(tap(raciones => console.log('Raciones cargadas:', raciones)));
  }

  // Obtener menú del día
  getMenuDia(): Observable<MenuItem[]> {
    return this.firestoreService.getCollection<MenuItem>('vistas/dia/menu')
      .pipe(tap(menu => console.log('Menú cargado:', menu)));
  }

  // Obtener escenas de eventos
  getEscenasEventos(): Observable<Escena[]> {
    return this.firestoreService.getCollection<Escena>('vistas/eventos/escenas');
  }

  // Obtener escenas de carta
  getEscenasCarta(): Observable<Escena[]> {
    return this.firestoreService.getCollection<Escena>('vistas/carta/escenas');
  }

  // Actualizar un ítem del menú
  async updateMenuItem(categoria: string, id: string, data: Partial<MenuItem>): Promise<void> {
    return this.firestoreService.updateDoc(`vistas/dia/${categoria}`, id, data);
  }

  // Agregar un ítem al menú
  async addMenuItem(categoria: string, item: MenuItem): Promise<string> {
    return this.firestoreService.addDoc(`vistas/dia/${categoria}`, item);
  }

  // Eliminar un ítem del menú
  async deleteMenuItem(categoria: string, id: string): Promise<void> {
    return this.firestoreService.deleteDoc(`vistas/dia/${categoria}`, id);
  }

  // Actualizar una escena
  async updateEscena(tipo: 'eventos' | 'carta', id: string, data: Partial<Escena>): Promise<void> {
    return this.firestoreService.updateDoc(`vistas/${tipo}/escenas`, id, data);
  }

  // Agregar una escena
  async addEscena(tipo: 'eventos' | 'carta', escena: Escena): Promise<string> {
    return this.firestoreService.addDoc(`vistas/${tipo}/escenas`, escena);
  }

  // Eliminar una escena
  async deleteEscena(tipo: 'eventos' | 'carta', id: string): Promise<void> {
    return this.firestoreService.deleteDoc(`vistas/${tipo}/escenas`, id);
  }
  
  // Reorganizar el orden de las escenas
  async reordenarEscenas(tipo: 'eventos' | 'carta', escenasOrdenadas: Escena[]): Promise<void> {
    for (let i = 0; i < escenasOrdenadas.length; i++) {
      const escena = escenasOrdenadas[i];
      await this.updateEscena(tipo, escena.id!, { orden: i + 1 });
    }
  }
}