// src/app/features/vistas/pages/vista-dia/vista-dia.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuItem } from '../../../../models';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-vista-dia',
  templateUrl: './vista-dia.component.html',
  styleUrls: ['./vista-dia.component.scss']
})
export class VistaDiaComponent implements OnInit, OnDestroy {
  // Observables con datos
  tapas$: Observable<MenuItem[]> = of([]);
  raciones$: Observable<MenuItem[]> = of([]);
  menuItems$: Observable<MenuItem[]> = of([]);
  
  // Categorías del menú como BehaviorSubjects para actualización reactiva
  primeros: MenuItem[] = [];
  segundos: MenuItem[] = [];
  postres: MenuItem[] = [];

  // Estados de carga
  loading = true;
  error = false;
  errorMessage = '';
  
  private subscription = new Subscription();

  constructor(private vistasService: VistasService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log('Inicializando VistaDiaComponent');
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Desuscribirse a suscripciones previas si existieran
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    
    try {
      // Cargar tapas con manejo de errores
      this.tapas$ = this.vistasService.getTapas().pipe(
        tap(tapas => {
          console.log('Tapas cargadas correctamente:', tapas);
        }),
        catchError(err => {
          console.error('Error al cargar tapas:', err);
          this.handleError('Error al cargar tapas', err);
          return of([]);
        })
      );
      
      // Cargar raciones con manejo de errores
      this.raciones$ = this.vistasService.getRaciones().pipe(
        tap(raciones => {
          console.log('Raciones cargadas correctamente:', raciones);
        }),
        catchError(err => {
          console.error('Error al cargar raciones:', err);
          this.handleError('Error al cargar raciones', err);
          return of([]);
        })
      );
      
      // Cargar menú y filtrar por categorías con manejo de errores
      this.menuItems$ = this.vistasService.getMenuDia().pipe(
        tap(menu => {
          console.log('Menú cargado correctamente:', menu);
        }),
        catchError(err => {
          console.error('Error al cargar menú:', err);
          this.handleError('Error al cargar menú', err);
          return of([]);
        })
      );
      
      // Suscribirse para procesar los items del menú por categorías
      this.subscription.add(
        this.menuItems$.subscribe({
          next: (items) => {
            console.log('Items del menú recibidos:', items);
            
            // Categorizar los ítems del menú
            this.primeros = items.filter(item => item.category === 'primeros');
            this.segundos = items.filter(item => item.category === 'segundos');
            this.postres = items.filter(item => item.category === 'postres');
            
            this.loading = false;
          },
          error: (err) => {
            console.error('Error en la suscripción del menú:', err);
            this.handleError('Error al procesar menú', err);
            this.loading = false;
          },
          complete: () => {
            console.log('Suscripción al menú completada');
          }
        })
      );
    } catch (error: any) {
      console.error('Error general en cargarDatos:', error);
      this.handleError('Error general en la aplicación', error);
      this.loading = false;
    }
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
    console.log("Destruyendo VistaDiaComponent");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}