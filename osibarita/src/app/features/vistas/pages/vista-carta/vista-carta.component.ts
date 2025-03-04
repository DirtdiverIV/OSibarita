// src/app/features/vistas/pages/vista-carta/vista-carta.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { RateLimiterService } from '../../../../core/services/rate-limiter.service';

@Component({
  selector: 'app-vista-carta',
  templateUrl: './vista-carta.component.html',
  styleUrls: ['./vista-carta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimización: detección de cambios OnPush
})
export class VistaCartaComponent implements OnInit, OnDestroy {
  // Escenas de carta
  escenas$: Observable<Escena[]> = of([]);
  currentIndex = 0;
  currentEscena: Escena | null = null;
  escenas: Escena[] = [];

  // Estados de carga
  loading = true;
  error = false;
  errorMessage = '';
  
  // Timer para cambiar de escena
  private timerInterval?: any;
  private subscription = new Subscription();
  private lastEscenasData = ''; // Para comparar si realmente hubo cambios

  constructor(
    private vistasService: VistasService,
    private rateLimiter: RateLimiterService,
    private cdr: ChangeDetectorRef // Para detección de cambios manual
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Configurar actualización periódica (cada 60 segundos)
    const refreshInterval = setInterval(() => this.actualizarDatos(), 60000);
    this.subscription.add(() => clearInterval(refreshInterval));
  }

  cargarDatos(): void {
    console.log('[Vista-Carta] Inicializando carga de datos');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-carta-carga')) {
      console.log('[Vista-Carta] Carga bloqueada por rate limiter');
      return;
    }
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Cancelar temporizador activo
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    
    // Cargar escenas de carta (una sola vez, no mantener suscripción activa)
    this.vistasService.getEscenasCarta().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Carta] Error al cargar escenas de carta:', err);
        this.handleError('Error al cargar carta', err);
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        return of([]);
      })
    ).subscribe(escenas => {
      console.log(`[Vista-Carta] ${escenas.length} escenas cargadas`);
      
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(escenas);
      if (newData === this.lastEscenasData) {
        console.log('[Vista-Carta] No hay cambios en los datos, omitiendo actualización');
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.lastEscenasData = newData;
      this.escenas = this.ordenarEscenas(escenas);
      
      if (this.escenas.length > 0) {
        this.currentIndex = 0;
        this.currentEscena = this.escenas[0];
        this.configurarTemporizador();
      }
      
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
  }

  // Actualizar datos sin mostrar loading
  private actualizarDatos(): void {
    console.log('[Vista-Carta] Actualizando datos periódicamente');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-carta-actualiza')) {
      console.log('[Vista-Carta] Actualización bloqueada por rate limiter');
      return;
    }
    
    this.vistasService.getEscenasCarta().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Carta] Error al actualizar escenas:', err);
        return of([]);
      })
    ).subscribe(escenas => {
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(escenas);
      if (newData === this.lastEscenasData) {
        console.log('[Vista-Carta] No hay cambios en los datos, omitiendo actualización');
        return;
      }
      
      console.log('[Vista-Carta] Datos actualizados con éxito');
      this.lastEscenasData = newData;
      
      // Guardar índice actual para intentar mantener la escena
      const currentId = this.currentEscena?.id;
      
      this.escenas = this.ordenarEscenas(escenas);
      
      // Intentar mantener la misma escena o ir a la primera
      if (currentId && this.escenas.length > 0) {
        const index = this.escenas.findIndex(e => e.id === currentId);
        this.currentIndex = index >= 0 ? index : 0;
      } else if (this.escenas.length > 0) {
        this.currentIndex = 0;
      }
      
      this.currentEscena = this.escenas[this.currentIndex] || null;
      
      // Solo reconfigurar temporizador si es necesario
      if (this.currentEscena && (!this.timerInterval || 
          this.currentEscena.duracion !== this.escenas[this.currentIndex]?.duracion)) {
        this.configurarTemporizador();
      }
      
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
  }

  // Ordenar escenas por el campo orden
  private ordenarEscenas(escenas: Escena[]): Escena[] {
    return [...escenas].sort((a, b) => a.orden - b.orden);
  }

  // Configurar temporizador para cambiar de escena
  private configurarTemporizador(): void {
    // Limpiar temporizador existente
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    
    // No configurar si no hay escena actual o no tiene duración
    if (!this.currentEscena || !this.currentEscena.duracion) {
      return;
    }
    
    // Duración en milisegundos (mínimo 15 segundos)
    const duracion = Math.max(15, this.currentEscena.duracion) * 1000;
    
    console.log(`[Vista-Carta] Configurando temporizador: ${duracion / 1000} segundos`);
    
    // Configurar nuevo temporizador
    this.timerInterval = setInterval(() => {
      this.cambiarEscena();
    }, duracion);
  }

  // Cambiar a la siguiente escena
  cambiarEscena(): void {
    if (this.escenas.length <= 1) {
      return;
    }
    
    this.currentIndex = (this.currentIndex + 1) % this.escenas.length;
    this.currentEscena = this.escenas[this.currentIndex];
    
    // Solo reconfigurar temporizador si la duración es diferente
    const duracionActual = this.currentEscena?.duracion;
    const duracionAnterior = this.escenas[(this.currentIndex - 1 + this.escenas.length) % this.escenas.length]?.duracion;
    
    if (duracionActual !== duracionAnterior) {
      this.configurarTemporizador();
    }
    
    this.cdr.detectChanges(); // Forzar detección de cambios
  }

  // Método para obtener una imagen de placeholder para cada plato
  getImagenPlatoPlaceholder(index: number): string {
    // Usamos el índice para dar variedad a los placeholders
    const variantes = ['entrante', 'pescado', 'carne', 'postre'];
    const tipo = variantes[index % variantes.length];
    return `assets/placeholder-${tipo}.jpg`;
  }

  // Método para manejar errores de manera uniforme
  handleError(message: string, error: any): void {
    this.error = true;
    if (error && error.message) {
      this.errorMessage = `${message}: ${error.message}`;
    } else {
      this.errorMessage = `${message}: Error desconocido`;
    }
  }

  // Método para reintentar la carga en caso de error
  retryLoading(): void {
    // Forzar bypass del rate limiter para el retry
    this.rateLimiter.resetRequestTimer('vista-carta-carga');
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    console.log("[Vista-Carta] Destruyendo componente - Limpiando recursos");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}