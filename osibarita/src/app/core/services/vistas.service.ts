// src/app/core/services/vistas.service.ts
import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Vista, ConfiguracionTV, MenuItem, Escena, MenuDia, MenuDiaItem } from '../../models';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VistasService {

  constructor(private firestoreService: FirestoreService) { }

  // Obtener todas las vistas
  getVistas(): Observable<Vista[]> {
    return this.firestoreService.getCollection<Vista>('vistas')
      .pipe(
        tap(vistas => console.log('Vistas cargadas:', vistas)),
        catchError(error => {
          console.error('Error al cargar vistas:', error);
          return of([]);
        })
      );
  }

  // Obtener configuración de una TV específica
  getConfiguracionTV(tvId: string): Observable<ConfiguracionTV> {
    return this.firestoreService.getDocObservable<ConfiguracionTV>('configuracion', tvId)
      .pipe(
        tap(config => console.log(`Configuración para ${tvId}:`, config)),
        catchError(error => {
          console.error(`Error al cargar configuración para ${tvId}:`, error);
          // Retornar una configuración por defecto en caso de error
          return of({ 
            vista: 'dia', 
            temporizador: 30, 
            ultimaActualizacion: new Date() 
          } as ConfiguracionTV);
        })
      );
  }

  // Actualizar configuración de una TV
  async updateConfiguracionTV(tvId: string, config: Partial<ConfiguracionTV>): Promise<void> {
    try {
      const updatedConfig = {
        ...config,
        ultimaActualizacion: new Date()
      };
      return this.firestoreService.updateDoc('configuracion', tvId, updatedConfig);
    } catch (error) {
      console.error(`Error al actualizar configuración para ${tvId}:`, error);
      throw error;
    }
  }

  // Obtener tapas del día
  getTapas(): Observable<MenuItem[]> {
    return this.firestoreService.getCollection<MenuItem>('vistas/dia/tapas')
      .pipe(
        tap(tapas => console.log('Tapas cargadas:', tapas)),
        catchError(error => {
          console.error('Error al cargar tapas:', error);
          return of([]);
        })
      );
  }

  // Obtener raciones del día
  getRaciones(): Observable<MenuItem[]> {
    return this.firestoreService.getCollection<MenuItem>('vistas/dia/raciones')
      .pipe(
        tap(raciones => console.log('Raciones cargadas:', raciones)),
        catchError(error => {
          console.error('Error al cargar raciones:', error);
          return of([]);
        })
      );
  }

  // Obtener información del menú del día
  getMenuDiaInfo(): Observable<MenuDia> {
    return this.firestoreService.getDocObservable<MenuDia>('vistas/dia/menu', 'info')
      .pipe(
        tap(info => console.log('Información del menú del día cargada:', info)),
        catchError(error => {
          console.error('Error al cargar información del menú del día:', error);
          // Retornar un objeto por defecto en caso de error
          return of({
            fecha: new Date(),
            precio: 0,
            descripcion: 'Información no disponible',
            disponible: false
          } as MenuDia);
        })
      );
  }
  
  // Obtener platos del menú del día
  getMenuDiaPlatos(): Observable<MenuDiaItem[]> {
    return this.firestoreService.getCollection<MenuDiaItem>('vistas/dia/platos')
      .pipe(
        tap(platos => console.log('Platos del menú del día cargados:', platos)),
        catchError(error => {
          console.error('Error al cargar platos del menú del día:', error);
          return of([]);
        })
      );
  }
  
  // Actualizar información del menú del día
  async updateMenuDiaInfo(data: Partial<MenuDia>): Promise<void> {
    try {
      return this.firestoreService.updateDoc('vistas/dia/menu', 'info', data);
    } catch (error) {
      console.error('Error al actualizar información del menú del día:', error);
      throw error;
    }
  }
  
  // Agregar un plato al menú del día
  async addMenuDiaPlato(plato: MenuDiaItem): Promise<string> {
    try {
      return this.firestoreService.addDoc('vistas/dia/platos', plato);
    } catch (error) {
      console.error('Error al agregar plato al menú del día:', error);
      throw error;
    }
  }
  
  // Actualizar un plato del menú del día
  async updateMenuDiaPlato(id: string, data: Partial<MenuDiaItem>): Promise<void> {
    try {
      return this.firestoreService.updateDoc('vistas/dia/platos', id, data);
    } catch (error) {
      console.error('Error al actualizar plato del menú del día:', error);
      throw error;
    }
  }
  
  // Eliminar un plato del menú del día
  async deleteMenuDiaPlato(id: string): Promise<void> {
    try {
      return this.firestoreService.deleteDoc('vistas/dia/platos', id);
    } catch (error) {
      console.error('Error al eliminar plato del menú del día:', error);
      throw error;
    }
  }

  // Obtener escenas de eventos
  getEscenasEventos(): Observable<Escena[]> {
    return this.firestoreService.getCollection<Escena>('vistas/eventos/escenas')
      .pipe(
        tap(escenas => console.log('Escenas de eventos cargadas:', escenas)),
        catchError(error => {
          console.error('Error al cargar escenas de eventos:', error);
          return of([]);
        })
      );
  }

  // Obtener escenas de carta
  getEscenasCarta(): Observable<Escena[]> {
    return this.firestoreService.getCollection<Escena>('vistas/carta/escenas')
      .pipe(
        tap(escenas => console.log('Escenas de carta cargadas:', escenas)),
        catchError(error => {
          console.error('Error al cargar escenas de carta:', error);
          return of([]);
        })
      );
  }

  // Actualizar un ítem del menú
  async updateMenuItem(categoria: string, id: string, data: Partial<MenuItem>): Promise<void> {
    try {
      return this.firestoreService.updateDoc(`vistas/dia/${categoria}`, id, data);
    } catch (error) {
      console.error(`Error al actualizar item del menú (${categoria}/${id}):`, error);
      throw error;
    }
  }

  // Agregar un ítem al menú
  async addMenuItem(categoria: string, item: MenuItem): Promise<string> {
    try {
      return this.firestoreService.addDoc(`vistas/dia/${categoria}`, item);
    } catch (error) {
      console.error(`Error al agregar item al menú (${categoria}):`, error);
      throw error;
    }
  }

  // Eliminar un ítem del menú
  async deleteMenuItem(categoria: string, id: string): Promise<void> {
    try {
      return this.firestoreService.deleteDoc(`vistas/dia/${categoria}`, id);
    } catch (error) {
      console.error(`Error al eliminar item del menú (${categoria}/${id}):`, error);
      throw error;
    }
  }

  // Actualizar una escena
  async updateEscena(tipo: 'eventos' | 'carta', id: string, data: Partial<Escena>): Promise<void> {
    try {
      return this.firestoreService.updateDoc(`vistas/${tipo}/escenas`, id, data);
    } catch (error) {
      console.error(`Error al actualizar escena (${tipo}/${id}):`, error);
      throw error;
    }
  }

  // Agregar una escena
  async addEscena(tipo: 'eventos' | 'carta', escena: Escena): Promise<string> {
    try {
      return this.firestoreService.addDoc(`vistas/${tipo}/escenas`, escena);
    } catch (error) {
      console.error(`Error al agregar escena (${tipo}):`, error);
      throw error;
    }
  }

  // Eliminar una escena
  async deleteEscena(tipo: 'eventos' | 'carta', id: string): Promise<void> {
    try {
      return this.firestoreService.deleteDoc(`vistas/${tipo}/escenas`, id);
    } catch (error) {
      console.error(`Error al eliminar escena (${tipo}/${id}):`, error);
      throw error;
    }
  }
  
  // Reorganizar el orden de las escenas
  async reordenarEscenas(tipo: 'eventos' | 'carta', escenasOrdenadas: Escena[]): Promise<void> {
    try {
      for (let i = 0; i < escenasOrdenadas.length; i++) {
        const escena = escenasOrdenadas[i];
        if (escena.id) {
          await this.updateEscena(tipo, escena.id, { orden: i + 1 });
        }
      }
    } catch (error) {
      console.error(`Error al reordenar escenas (${tipo}):`, error);
      throw error;
    }
  }
}