// src/app/features/admin/pages/gestion-vistas/gestion-vistas.component.ts
import { Component, OnInit } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { Vista } from '../../../../models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-vistas',
  templateUrl: './gestion-vistas.component.html',
  styleUrls: ['./gestion-vistas.component.scss']
})
export class GestionVistasComponent implements OnInit {
  // Lista de vistas disponibles
  vistas$: Observable<Vista[]> = of([]);
  
  // Vista seleccionada actualmente
  vistaSeleccionada: string = '';
  
  // Estados
  loading = true;
  error = false;
  errorMessage = '';
  
  constructor(private vistasService: VistasService) { }

  ngOnInit(): void {
    this.cargarVistas();
  }

  cargarVistas(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    
    this.vistas$ = this.vistasService.getVistas().pipe(
      catchError(error => {
        console.error('Error al cargar vistas:', error);
        this.error = true;
        this.errorMessage = 'Error al cargar la lista de vistas';
        return of([]);
      })
    );
    
    // Suscribirse para marcar como cargado y seleccionar la primera vista por defecto
    this.vistas$.subscribe(vistas => {
      this.loading = false;
      
      if (vistas && vistas.length > 0 && !this.vistaSeleccionada) {
        this.seleccionarVista(vistas[0].id);
      }
    });
  }

  seleccionarVista(vistaId: string): void {
    this.vistaSeleccionada = vistaId;
  }
}