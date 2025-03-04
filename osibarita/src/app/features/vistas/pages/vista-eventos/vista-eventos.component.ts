// src/app/features/vistas/pages/vista-eventos/vista-eventos.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { RateLimiterService } from '../../../../core/services/rate-limiter.service';

@Component({
  selector: 'app-vista-eventos',
  templateUrl: './vista-eventos.component.html',
  styleUrls: ['./vista-eventos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimización: detección de cambios OnPush
})
export class VistaEventosComponent implements OnInit, OnDestroy {
  // Eventos
  eventos$: Observable<Escena[]> = of([]);
  currentIndex = 0;
  currentEvento: Escena | null = null;
  eventos: Escena[] = [];

  // Estados de carga
  loading = true;
  error = false;
  errorMessage = '';
  
  // Timer para cambiar de escena
  private timerInterval?: any;
  private subscription = new Subscription();
  private lastEscenasData = ''; // Para comparar si realmente hubo cambios

  // Tipos de eventos que ofrecemos (para mostrar si no hay eventos configurados)
  tiposEventos = [
    {
      titulo: 'Celebraciones Familiares',
      descripcion: 'Cumpleaños, aniversarios, reuniones...',
      capacidad: '10-50 personas',
      mensaje: 'Haz que tu día especial sea inolvidable con nuestra gastronomía'
    },
    {
      titulo: 'Eventos Empresariales',
      descripcion: 'Reuniones, presentaciones, comidas de negocios...',
      capacidad: '20-100 personas',
      mensaje: 'Espacios adaptados para todas tus necesidades corporativas'
    },
    {
      titulo: 'Bodas y Ceremonias',
      descripcion: 'El día más importante merece el mejor menú',
      capacidad: '50-150 personas',
      mensaje: 'Menús personalizados con la calidad que merece tu celebración'
    }
  ];

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
    console.log('[Vista-Eventos] Inicializando carga de datos');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-eventos-carga')) {
      console.log('[Vista-Eventos] Carga bloqueada por rate limiter');
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
    
    // Cargar escenas de eventos (una sola vez, no mantener suscripción activa)
    this.vistasService.getEscenasEventos().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Eventos] Error al cargar escenas de eventos:', err);
        this.handleError('Error al cargar eventos', err);
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        return of([]);
      })
    ).subscribe(eventos => {
      console.log(`[Vista-Eventos] ${eventos.length} escenas cargadas`);
      
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(eventos);
      if (newData === this.lastEscenasData) {
        console.log('[Vista-Eventos] No hay cambios en los datos, omitiendo actualización');
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.lastEscenasData = newData;
      this.eventos = this.ordenarEscenas(eventos);
      
      if (this.eventos.length > 0) {
        this.currentIndex = 0;
        this.currentEvento = this.eventos[0];
        this.configurarTemporizador();
      }
      
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
  }

  // Actualizar datos sin mostrar loading
  private actualizarDatos(): void {
    console.log('[Vista-Eventos] Actualizando datos periódicamente');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-eventos-actualiza')) {
      console.log('[Vista-Eventos] Actualización bloqueada por rate limiter');
      return;
    }
    
    this.vistasService.getEscenasEventos().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Eventos] Error al actualizar escenas:', err);
        return of([]);
      })
    ).subscribe(eventos => {
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(eventos);
      if (newData === this.lastEscenasData) {
        console.log('[Vista-Eventos] No hay cambios en los datos, omitiendo actualización');
        return;
      }
      
      console.log('[Vista-Eventos] Datos actualizados con éxito');
      this.lastEscenasData = newData;
      
      // Guardar índice actual para intentar mantener la escena
      const currentId = this.currentEvento?.id;
      
      this.eventos = this.ordenarEscenas(eventos);
      
      // Intentar mantener la misma escena o ir a la primera
      if (currentId && this.eventos.length > 0) {
        const index = this.eventos.findIndex(e => e.id === currentId);
        this.currentIndex = index >= 0 ? index : 0;
      } else if (this.eventos.length > 0) {
        this.currentIndex = 0;
      }
      
      this.currentEvento = this.eventos[this.currentIndex] || null;
      
      // Solo reconfigurar temporizador si es necesario
      if (this.currentEvento && (!this.timerInterval || 
          this.currentEvento.duracion !== this.eventos[this.currentIndex]?.duracion)) {
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
    
    // No configurar si no hay evento actual o no tiene duración
    if (!this.currentEvento || !this.currentEvento.duracion) {
      return;
    }
    
    // Duración en milisegundos (mínimo 15 segundos)
    const duracion = Math.max(15, this.currentEvento.duracion) * 1000;
    
    console.log(`[Vista-Eventos] Configurando temporizador: ${duracion / 1000} segundos`);
    
    // Configurar nuevo temporizador
    this.timerInterval = setInterval(() => {
      this.cambiarEscena();
    }, duracion);
  }

  // Cambiar a la siguiente escena
  cambiarEscena(): void {
    if (this.eventos.length <= 1) {
      return;
    }
    
    this.currentIndex = (this.currentIndex + 1) % this.eventos.length;
    this.currentEvento = this.eventos[this.currentIndex];
    
    // Solo reconfigurar temporizador si la duración es diferente
    const duracionActual = this.currentEvento?.duracion;
    const duracionAnterior = this.eventos[(this.currentIndex - 1 + this.eventos.length) % this.eventos.length]?.duracion;
    
    if (duracionActual !== duracionAnterior) {
      this.configurarTemporizador();
    }
    
    this.cdr.detectChanges(); // Forzar detección de cambios
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
    this.rateLimiter.resetRequestTimer('vista-eventos-carga');
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    console.log("[Vista-Eventos] Destruyendo componente - Limpiando recursos");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}