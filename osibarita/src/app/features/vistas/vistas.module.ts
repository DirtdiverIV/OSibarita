// src/app/features/vistas/vistas.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VistasRoutingModule } from './vistas-routing.module';
import { VistaDiaComponent } from './pages/vista-dia/vista-dia.component';
import { TvLayoutComponent } from './pages/tv-layout/tv-layout.component';
import { DiagnosticoComponent } from './pages/diagnostico/diagnostico.component';
import { VistaCartaComponent } from './pages/vista-carta/vista-carta.component';
import { VistaEventosComponent } from './pages/vista-eventos/vista-eventos.component';
import { VistaMenuComponent } from './pages/vista-menu/vista-menu.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    VistaDiaComponent,
    TvLayoutComponent,
    DiagnosticoComponent,
    VistaCartaComponent,
    VistaEventosComponent,
    VistaMenuComponent
  ],
  imports: [
    CommonModule,
    VistasRoutingModule,
    SharedModule
  ]
})
export class VistasModule { }