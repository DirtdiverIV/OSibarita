// src/app/features/vistas/pages/vista-dia/vista-dia.component.ts
import { Component, OnInit } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuItem } from '../../../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vista-dia',
  templateUrl: './vista-dia.component.html',
  styleUrls: ['./vista-dia.component.scss']
})
export class VistaDiaComponent implements OnInit {
  tapas$!: Observable<MenuItem[]>;
  raciones$!: Observable<MenuItem[]>;
  menuItems$!: Observable<MenuItem[]>;
  
  // Categorías del menú
  primeros: MenuItem[] = [];
  segundos: MenuItem[] = [];
  postres: MenuItem[] = [];

  constructor(private vistasService: VistasService) {}

  ngOnInit(): void {
    // Cargar tapas
    this.tapas$ = this.vistasService.getTapas();
    
    // Cargar raciones
    this.raciones$ = this.vistasService.getRaciones();
    
    // Cargar menú y filtrar por categorías
    this.menuItems$ = this.vistasService.getMenuDia();
    this.menuItems$.subscribe(items => {
      this.primeros = items.filter(item => item.category === 'primeros');
      this.segundos = items.filter(item => item.category === 'segundos');
      this.postres = items.filter(item => item.category === 'postres');
    });
  }
}