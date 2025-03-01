// src/app/features/vistas/pages/vista-dia/vista-dia.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuItem } from '../../../../models';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-vista-dia',
  templateUrl: './vista-dia.component.html',
  styleUrls: ['./vista-dia.component.scss']
})
export class VistaDiaComponent implements OnInit, OnDestroy {
  tapas$!: Observable<MenuItem[]>;
  raciones$!: Observable<MenuItem[]>;
  menuItems$!: Observable<MenuItem[]>;
  
  // Categorías del menú
  primeros: MenuItem[] = [];
  segundos: MenuItem[] = [];
  postres: MenuItem[] = [];

  private subscription = new Subscription();

  constructor(private vistasService: VistasService) {}

  ngOnInit(): void {
    console.log('Inicializando VistaDiaComponent');
    
    // Cargar tapas
    this.tapas$ = this.vistasService.getTapas();
    
    // Cargar raciones
    this.raciones$ = this.vistasService.getRaciones();
    
    // Cargar menú y filtrar por categorías
    this.menuItems$ = this.vistasService.getMenuDia();
    
    // Suscribirse para procesar los items del menú por categorías
    this.subscription.add(
      this.menuItems$.subscribe(items => {
        console.log('Items del menú cargados:', items);
        this.primeros = items.filter(item => item.category === 'primeros');
        this.segundos = items.filter(item => item.category === 'segundos');
        this.postres = items.filter(item => item.category === 'postres');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}