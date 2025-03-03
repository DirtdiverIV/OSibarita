// src/app/features/vistas/pages/vista-dia/vista-dia.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuItem, MenuDia, MenuDiaItem } from '../../../../models';
import { BehaviorSubject, Observable, Subscription, of, combineLatest } from 'rxjs';
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
  
  // Menú del día
  menuInfo$: Observable<MenuDia> = of({} as MenuDia);
  menuPlatos$: Observable<MenuDiaItem[]> = of([]);
  
  // Categorías del menú como arrays para la vista
  primeros: MenuDiaItem[] = [];
  segundos: MenuDiaItem[] = [];
  postres: MenuDiaItem[] = [];

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
      
      // Cargar información del menú del día
      this.menuInfo$ = this.vistasService.getMenuDiaInfo().pipe(
        tap(info => {
          console.log('Información del menú del día cargada correctamente:', info);
        }),
        catchError(err => {
          console.error('Error al cargar información del menú del día:', err);
          this.handleError('Error al cargar información del menú', err);
          return of({} as MenuDia);
        })
      );
      
      // Cargar platos del menú del día
      this.menuPlatos$ = this.vistasService.getMenuDiaPlatos().pipe(
        tap(platos => {
          console.log('Platos del menú del día cargados correctamente:', platos);
        }),
        catchError(err => {
          console.error('Error al cargar platos del menú del día:', err);
          this.handleError('Error al cargar platos del menú', err);
          return of([]);
        })
      );
      
      // Suscribirse para procesar los platos del menú por categorías
      this.subscription.add(
        this.menuPlatos$.subscribe({
          next: (platos) => {
            console.log('Platos del menú recibidos:', platos);
            
            // Categorizar los platos del menú
            this.primeros = platos.filter(plato => plato.category === 'primeros');
            this.segundos = platos.filter(plato => plato.category === 'segundos');
            this.postres = platos.filter(plato => plato.category === 'postres');
            
            this.loading = false;
          },
          error: (err) => {
            console.error('Error en la suscripción de platos del menú:', err);
            this.handleError('Error al procesar menú', err);
            this.loading = false;
          },
          complete: () => {
            console.log('Suscripción a platos del menú completada');
          }
        })
      );
      
      // Usando combineLatest para determinar cuando todas las cargas están completas
      this.subscription.add(
        combineLatest([
          this.tapas$,
          this.raciones$,
          this.menuInfo$,
          this.menuPlatos$
        ]).subscribe({
          next: () => {
            this.loading = false;
          },
          error: (err) => {
            console.error('Error en la carga de datos:', err);
            this.loading = false;
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