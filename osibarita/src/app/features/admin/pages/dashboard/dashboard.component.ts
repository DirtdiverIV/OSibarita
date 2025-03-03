// src/app/features/admin/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Vista, ConfiguracionTV } from '../../../../models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Observables para datos
  vistas$: Observable<Vista[]> = of([]);
  configTV1$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV2$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV3$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV4$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  
  // Estado de carga
  loading = true;
  
  constructor(private vistasService: VistasService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar vistas disponibles
    this.vistas$ = this.vistasService.getVistas().pipe(
      catchError(error => {
        console.error('Error al cargar vistas:', error);
        return of([]);
      })
    );
    
    // Cargar configuración de cada TV
    this.configTV1$ = this.vistasService.getConfiguracionTV('tv1').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV1:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV2$ = this.vistasService.getConfiguracionTV('tv2').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV2:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV3$ = this.vistasService.getConfiguracionTV('tv3').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV3:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV4$ = this.vistasService.getConfiguracionTV('tv4').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV4:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    // Marcar como cargado
    this.loading = false;
  }
  
  // Obtener el nombre de la vista a partir de su ID
  getNombreVista(vistaId: string, vistas: Vista[]): string {
    const vista = vistas.find(v => v.id === vistaId);
    return vista ? vista.nombre : 'Vista desconocida';
  }
  
  // Navegar a una TV específica en una nueva ventana
  abrirTV(tvId: number): void {
    window.open(`/tv?tv=${tvId}`, `_blank_tv${tvId}`);
  }
}