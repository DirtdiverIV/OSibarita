// src/app/features/vistas/pages/vista-carta/vista-carta.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-vista-carta',
  templateUrl: './vista-carta.component.html',
  styleUrls: ['./vista-carta.component.scss']
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

  constructor(private vistasService: VistasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log('Inicializando VistaCartaComponent');
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Cancelar suscripciones previas
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    
    // Cargar escenas de carta
    this.escenas$ = this.vistasService.getEscenasCarta().pipe(
      tap(escenas => {
        console.log('Escenas de carta cargadas correctamente:', escenas);
        this.escenas = this.ordenarEscenas(escenas);
        
        if (this.escenas.length > 0) {
          this.currentIndex = 0;
          this.currentEscena = this.escenas[0];
          this.configurarTemporizador();
        }
        
        this.loading = false;
      }),
      catchError(err => {
        console.error('Error al cargar escenas de carta:', err);
        this.handleError('Error al cargar carta', err);
        this.loading = false;
        return of([]);
      })
    );
    
    // Suscribirse al observable
    this.subscription.add(
      this.escenas$.subscribe()
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
    
    // No configurar si no hay escena actual o no tiene duración
    if (!this.currentEscena || !this.currentEscena.duracion) {
      return;
    }
    
    // Duración en milisegundos
    const duracion = this.currentEscena.duracion * 1000;
    
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
    this.configurarTemporizador();
  }

  // Método para obtener una imagen de placeholder para cada plato
  // En un escenario real, esto vendría de la base de datos
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
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    console.log("Destruyendo VistaCartaComponent");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}