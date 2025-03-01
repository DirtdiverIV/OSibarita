// src/app/features/vistas/vistas.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VistasRoutingModule } from './vistas-routing.module';
import { VistaDiaComponent } from './pages/vista-dia/vista-dia.component';
import { TvLayoutComponent } from './pages/tv-layout/tv-layout.component';
import { SharedModule } from '../../shared/shared.module';

// Importaremos los componentes adicionales a medida que los creemos
// import { VistaMenuComponent } from './pages/vista-menu/vista-menu.component';
// import { VistaEventosComponent } from './pages/vista-eventos/vista-eventos.component';
// import { VistaCartaComponent } from './pages/vista-carta/vista-carta.component';

@NgModule({
  declarations: [
    VistaDiaComponent,
    TvLayoutComponent,
    // VistaMenuComponent,
    // VistaEventosComponent,
    // VistaCartaComponent
  ],
  imports: [
    CommonModule,
    VistasRoutingModule,
    SharedModule
  ]
})
export class VistasModule { }