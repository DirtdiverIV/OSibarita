// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GestionVistasComponent } from './pages/gestion-vistas/gestion-vistas.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { SharedModule } from '../../shared/shared.module';
import { MenuDiaEditorComponent } from './components/menu-dia-editor/menu-dia-editor.component';
import { EventosEditorComponent } from './components/eventos-editor/eventos-editor.component';
import { CartaEditorComponent } from './components/carta-editor/carta-editor.component';


@NgModule({
  declarations: [
    DashboardComponent,
    GestionVistasComponent,
    ConfiguracionComponent,
    MenuDiaEditorComponent,
    EventosEditorComponent,
    CartaEditorComponent
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminModule { }