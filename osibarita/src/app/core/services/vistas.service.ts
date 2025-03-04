// src/app/core/services/vistas.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseOptimizerService } from './firebase-optimizer.service';
import { Vista, ConfiguracionTV, MenuItem, Escena, MenuDia, MenuDiaItem } from '../../models';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VistasService implements OnDestroy {
  // Caché para observables compartidos
  private cachedObservables: Map<string, Observable<any>> = new Map();

  constructor(private firebaseOptimizer: FirebaseOptimizerService) { }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones al destruir el servicio
    this.firebaseOptimizer.cleanupSubscriptions();
  }

  // Obtener todas las vistas
  getVistas(): Observable<Vista[]> {
    const cacheKey = 'vistas';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<Vista[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<Vista>('vistas')
      .pipe(
        catchError(error => {
          console.error('Error al cargar vistas:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Obtener configuración de una TV específica
  getConfiguracionTV(tvId: string): Observable<ConfiguracionTV> {
    const cacheKey = `config:${tvId}`;
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<ConfiguracionTV>;
    }

    const observable = this.firebaseOptimizer.getDocument<ConfiguracionTV>('configuracion', tvId)
      .pipe(
        map(config => config || { 
          vista: 'dia', 
          temporizador: 60, // Aumentado a 60 segundos
          ultimaActualizacion: new Date() 
        } as ConfiguracionTV),
        catchError(error => {
          console.error(`Error al cargar configuración para ${tvId}:`, error);
          return of({ 
            vista: 'dia', 
            temporizador: 60, 
            ultimaActualizacion: new Date() 
          } as ConfiguracionTV);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Actualizar configuración de una TV
  async updateConfiguracionTV(tvId: string, config: Partial<ConfiguracionTV>): Promise<void> {
    try {
      const updatedConfig = {
        ...config,
        ultimaActualizacion: new Date()
      };
      await this.firebaseOptimizer.updateDoc('configuracion', tvId, updatedConfig);
      
      // Invalidar caché para este TV
      this.invalidateCache(`config:${tvId}`);
    } catch (error) {
      console.error(`Error al actualizar configuración para ${tvId}:`, error);
      throw error;
    }
  }

  // Obtener tapas del día
  getTapas(): Observable<MenuItem[]> {
    const cacheKey = 'tapas';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<MenuItem[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<MenuItem>('vistas/dia/tapas')
      .pipe(
        catchError(error => {
          console.error('Error al cargar tapas:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Obtener raciones del día
  getRaciones(): Observable<MenuItem[]> {
    const cacheKey = 'raciones';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<MenuItem[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<MenuItem>('vistas/dia/raciones')
      .pipe(
        catchError(error => {
          console.error('Error al cargar raciones:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Obtener información del menú del día
  getMenuDiaInfo(): Observable<MenuDia> {
    const cacheKey = 'menuInfo';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<MenuDia>;
    }

    const observable = this.firebaseOptimizer.getDocument<MenuDia>('vistas/dia/menu', 'info')
      .pipe(
        map(info => info || {
          fecha: new Date(),
          precio: 0,
          descripcion: 'Información no disponible',
          disponible: false
        } as MenuDia),
        catchError(error => {
          console.error('Error al cargar información del menú del día:', error);
          return of({
            fecha: new Date(),
            precio: 0,
            descripcion: 'Información no disponible',
            disponible: false
          } as MenuDia);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }
  
  // Obtener platos del menú del día
  getMenuDiaPlatos(): Observable<MenuDiaItem[]> {
    const cacheKey = 'menuPlatos';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<MenuDiaItem[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<MenuDiaItem>('vistas/dia/platos')
      .pipe(
        catchError(error => {
          console.error('Error al cargar platos del menú del día:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }
  
  // Actualizar información del menú del día
  async updateMenuDiaInfo(data: Partial<MenuDia>): Promise<void> {
    try {
      await this.firebaseOptimizer.updateDoc('vistas/dia/menu', 'info', data);
      this.invalidateCache('menuInfo');
    } catch (error) {
      console.error('Error al actualizar información del menú del día:', error);
      throw error;
    }
  }
  
  // Agregar un plato al menú del día
  async addMenuDiaPlato(plato: MenuDiaItem): Promise<string> {
    try {
      const id = await this.firebaseOptimizer.addDoc('vistas/dia/platos', plato);
      this.invalidateCache('menuPlatos');
      return id;
    } catch (error) {
      console.error('Error al agregar plato al menú del día:', error);
      throw error;
    }
  }
  
  // Actualizar un plato del menú del día
  async updateMenuDiaPlato(id: string, data: Partial<MenuDiaItem>): Promise<void> {
    try {
      await this.firebaseOptimizer.updateDoc('vistas/dia/platos', id, data);
      this.invalidateCache('menuPlatos');
    } catch (error) {
      console.error('Error al actualizar plato del menú del día:', error);
      throw error;
    }
  }
  
  // Eliminar un plato del menú del día
  async deleteMenuDiaPlato(id: string): Promise<void> {
    try {
      await this.firebaseOptimizer.deleteDoc('vistas/dia/platos', id);
      this.invalidateCache('menuPlatos');
    } catch (error) {
      console.error('Error al eliminar plato del menú del día:', error);
      throw error;
    }
  }

  // Obtener escenas de eventos
  getEscenasEventos(): Observable<Escena[]> {
    const cacheKey = 'escenasEventos';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<Escena[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<Escena>('vistas/eventos/escenas')
      .pipe(
        catchError(error => {
          console.error('Error al cargar escenas de eventos:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Obtener escenas de carta
  getEscenasCarta(): Observable<Escena[]> {
    const cacheKey = 'escenasCarta';
    if (this.cachedObservables.has(cacheKey)) {
      return this.cachedObservables.get(cacheKey) as Observable<Escena[]>;
    }

    const observable = this.firebaseOptimizer.getCollection<Escena>('vistas/carta/escenas')
      .pipe(
        catchError(error => {
          console.error('Error al cargar escenas de carta:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    
    this.cachedObservables.set(cacheKey, observable);
    return observable;
  }

  // Actualizar un ítem del menú
  async updateMenuItem(categoria: string, id: string, data: Partial<MenuItem>): Promise<void> {
    try {
      await this.firebaseOptimizer.updateDoc(`vistas/dia/${categoria}`, id, data);
      this.invalidateCache(categoria === 'tapas' ? 'tapas' : 'raciones');
    } catch (error) {
      console.error(`Error al actualizar item del menú (${categoria}/${id}):`, error);
      throw error;
    }
  }

  // Agregar un ítem al menú
  async addMenuItem(categoria: string, item: MenuItem): Promise<string> {
    try {
      const id = await this.firebaseOptimizer.addDoc(`vistas/dia/${categoria}`, item);
      this.invalidateCache(categoria === 'tapas' ? 'tapas' : 'raciones');
      return id;
    } catch (error) {
      console.error(`Error al agregar item al menú (${categoria}):`, error);
      throw error;
    }
  }

  // Eliminar un ítem del menú
  async deleteMenuItem(categoria: string, id: string): Promise<void> {
    try {
      await this.firebaseOptimizer.deleteDoc(`vistas/dia/${categoria}`, id);
      this.invalidateCache(categoria === 'tapas' ? 'tapas' : 'raciones');
    } catch (error) {
      console.error(`Error al eliminar item del menú (${categoria}/${id}):`, error);
      throw error;
    }
  }

  // Actualizar una escena
  async updateEscena(tipo: 'eventos' | 'carta', id: string, data: Partial<Escena>): Promise<void> {
    try {
      await this.firebaseOptimizer.updateDoc(`vistas/${tipo}/escenas`, id, data);
      this.invalidateCache(tipo === 'eventos' ? 'escenasEventos' : 'escenasCarta');
    } catch (error) {
      console.error(`Error al actualizar escena (${tipo}/${id}):`, error);
      throw error;
    }
  }

  // Agregar una escena
  async addEscena(tipo: 'eventos' | 'carta', escena: Escena): Promise<string> {
    try {
      const id = await this.firebaseOptimizer.addDoc(`vistas/${tipo}/escenas`, escena);
      this.invalidateCache(tipo === 'eventos' ? 'escenasEventos' : 'escenasCarta');
      return id;
    } catch (error) {
      console.error(`Error al agregar escena (${tipo}):`, error);
      throw error;
    }
  }

  // Eliminar una escena
  async deleteEscena(tipo: 'eventos' | 'carta', id: string): Promise<void> {
    try {
      await this.firebaseOptimizer.deleteDoc(`vistas/${tipo}/escenas`, id);
      this.invalidateCache(tipo === 'eventos' ? 'escenasEventos' : 'escenasCarta');
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
      this.invalidateCache(tipo === 'eventos' ? 'escenasEventos' : 'escenasCarta');
    } catch (error) {
      console.error(`Error al reordenar escenas (${tipo}):`, error);
      throw error;
    }
  }

  // Invalidar caché específica para forzar una recarga
  private invalidateCache(cacheKey: string): void {
    this.cachedObservables.delete(cacheKey);
  }
}