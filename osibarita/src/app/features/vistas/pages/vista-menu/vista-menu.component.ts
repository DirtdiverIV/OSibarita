// src/app/features/vistas/pages/vista-menu/vista-menu.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuDia, MenuDiaItem } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-vista-menu',
  templateUrl: './vista-menu.component.html',
  styleUrls: ['./vista-menu.component.scss']
})
export class VistaMenuComponent implements OnInit, OnDestroy {
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
    console.log('Inicializando VistaMenuComponent');
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Cancelar suscripciones previas
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    
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
    
    // Cargar platos del menú del día y suscribirse
    this.subscription.add(
      this.vistasService.getMenuDiaPlatos().pipe(
        tap(platos => {
          console.log('Platos del menú del día cargados correctamente:', platos);
          // Categorizar los platos del menú
          this.primeros = platos.filter(plato => plato.category === 'primeros');
          this.segundos = platos.filter(plato => plato.category === 'segundos');
          this.postres = platos.filter(plato => plato.category === 'postres');
          this.loading = false;
        }),
        catchError(err => {
          console.error('Error al cargar platos del menú del día:', err);
          this.handleError('Error al cargar platos del menú', err);
          this.loading = false;
          return of([]);
        })
      ).subscribe()
    );
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
    console.log("Destruyendo VistaMenuComponent");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}