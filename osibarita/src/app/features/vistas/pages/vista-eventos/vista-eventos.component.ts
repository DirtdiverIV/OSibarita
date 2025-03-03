// src/app/features/vistas/pages/vista-eventos/vista-eventos.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-vista-eventos',
  templateUrl: './vista-eventos.component.html',
  styleUrls: ['./vista-eventos.component.scss']
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

  constructor(private vistasService: VistasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log('Inicializando VistaEventosComponent');
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Cancelar suscripciones previas
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    
    // Cargar escenas de eventos
    this.eventos$ = this.vistasService.getEscenasEventos().pipe(
      tap(eventos => {
        console.log('Escenas de eventos cargadas correctamente:', eventos);
        this.eventos = this.ordenarEscenas(eventos);
        
        if (this.eventos.length > 0) {
          this.currentIndex = 0;
          this.currentEvento = this.eventos[0];
          this.configurarTemporizador();
        }
        
        this.loading = false;
      }),
      catchError(err => {
        console.error('Error al cargar escenas de eventos:', err);
        this.handleError('Error al cargar eventos', err);
        this.loading = false;
        return of([]);
      })
    );
    
    // Suscribirse al observable
    this.subscription.add(
      this.eventos$.subscribe()
    );
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
    }
    
    // No configurar si no hay evento actual o no tiene duración
    if (!this.currentEvento || !this.currentEvento.duracion) {
      return;
    }
    
    // Duración en milisegundos
    const duracion = this.currentEvento.duracion * 1000;
    
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
    this.configurarTemporizador();
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
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    console.log("Destruyendo VistaEventosComponent");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}