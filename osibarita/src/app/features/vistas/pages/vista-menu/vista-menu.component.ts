// src/app/features/vistas/pages/vista-menu/vista-menu.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuDia, MenuDiaItem } from '../../../../models';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { RateLimiterService } from '../../../../core/services/rate-limiter.service';

@Component({
  selector: 'app-vista-menu',
  templateUrl: './vista-menu.component.html',
  styleUrls: ['./vista-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimización: detección de cambios OnPush
})
export class VistaMenuComponent implements OnInit, OnDestroy {
  // Menú del día
  menuInfo$: Observable<MenuDia> = of({} as MenuDia);
  
  // Categorías del menú como arrays para la vista
  primeros: MenuDiaItem[] = [];
  segundos: MenuDiaItem[] = [];
  postres: MenuDiaItem[] = [];

  // Estados de carga
  loading = true;
  error = false;
  errorMessage = '';
  
  private subscription = new Subscription();
  private lastPlatosData = ''; // Para comparar si realmente hubo cambios
  private lastMenuInfoData = ''; // Para comparar si realmente hubo cambios en la info del menú

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
    console.log('[Vista-Menu] Inicializando carga de datos');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-menu-carga')) {
      console.log('[Vista-Menu] Carga bloqueada por rate limiter');
      return;
    }
    
    // Reiniciar estados
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    // Cargar información del menú del día
    this.subscription.add(
      this.vistasService.getMenuDiaInfo().pipe(
        take(1),
        catchError(err => {
          console.error('[Vista-Menu] Error al cargar información del menú del día:', err);
          this.handleError('Error al cargar información del menú', err);
          return of({} as MenuDia);
        })
      ).subscribe(info => {
        // Verificar si realmente hubo cambios
        const newData = JSON.stringify(info);
        if (newData !== this.lastMenuInfoData) {
          console.log('[Vista-Menu] Actualizando información del menú');
          this.lastMenuInfoData = newData;
          this.menuInfo$ = of(info);
          this.cdr.detectChanges();
        }
      })
    );
    
    // Suscribirse para procesar los platos del menú por categorías
    this.subscription.add(
      this.vistasService.getMenuDiaPlatos().pipe(
        take(1),
        catchError(err => {
          console.error('[Vista-Menu] Error al cargar platos del menú del día:', err);
          this.handleError('Error al cargar platos del menú', err);
          this.loading = false;
          this.cdr.detectChanges();
          return of([]);
        })
      ).subscribe(platos => {
        console.log(`[Vista-Menu] ${platos.length} platos cargados`);
        
        // Verificar si realmente hubo cambios
        const newData = JSON.stringify(platos);
        if (newData === this.lastPlatosData) {
          console.log('[Vista-Menu] No hay cambios en los datos, omitiendo actualización');
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        
        this.lastPlatosData = newData;
        
        // Categorizar los platos del menú
        this.primeros = platos.filter(plato => plato.category === 'primeros');
        this.segundos = platos.filter(plato => plato.category === 'segundos');
        this.postres = platos.filter(plato => plato.category === 'postres');
        
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      })
    );
  }

  // Actualizar datos sin mostrar loading
  private actualizarDatos(): void {
    console.log('[Vista-Menu] Actualizando datos periódicamente');
    
    // Verificar si ya se realizó una petición reciente
    if (!this.rateLimiter.canMakeRequest('vista-menu-actualiza')) {
      console.log('[Vista-Menu] Actualización bloqueada por rate limiter');
      return;
    }
    
    // Primero, actualizar información del menú
    this.vistasService.getMenuDiaInfo().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Menu] Error al actualizar información del menú:', err);
        return of({} as MenuDia);
      })
    ).subscribe(info => {
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(info);
      if (newData !== this.lastMenuInfoData) {
        console.log('[Vista-Menu] Actualizando información del menú');
        this.lastMenuInfoData = newData;
        this.menuInfo$ = of(info);
        this.cdr.detectChanges();
      }
    });
    
    // Luego, actualizar platos
    this.vistasService.getMenuDiaPlatos().pipe(
      take(1),
      catchError(err => {
        console.error('[Vista-Menu] Error al actualizar platos del menú:', err);
        return of([]);
      })
    ).subscribe(platos => {
      // Verificar si realmente hubo cambios
      const newData = JSON.stringify(platos);
      if (newData === this.lastPlatosData) {
        console.log('[Vista-Menu] No hay cambios en los platos, omitiendo actualización');
        return;
      }
      
      console.log('[Vista-Menu] Platos actualizados con éxito');
      this.lastPlatosData = newData;
      
      // Categorizar los platos del menú
      this.primeros = platos.filter(plato => plato.category === 'primeros');
      this.segundos = platos.filter(plato => plato.category === 'segundos');
      this.postres = platos.filter(plato => plato.category === 'postres');
      
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
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
    this.rateLimiter.resetRequestTimer('vista-menu-carga');
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    console.log("[Vista-Menu] Destruyendo componente - Limpiando suscripciones");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}