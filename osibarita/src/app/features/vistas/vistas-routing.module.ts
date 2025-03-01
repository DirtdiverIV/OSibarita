// src/app/features/vistas/vistas-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistaDiaComponent } from './pages/vista-dia/vista-dia.component';
import { TvLayoutComponent } from './pages/tv-layout/tv-layout.component';
import { DiagnosticoComponent } from './pages/diagnostico/diagnostico.component';
import { VistaCartaComponent } from './pages/vista-carta/vista-carta.component';
import { VistaEventosComponent } from './pages/vista-eventos/vista-eventos.component';
import { VistaMenuComponent } from './pages/vista-menu/vista-menu.component';

const routes: Routes = [
  {
    path: '',
    component: TvLayoutComponent,
    children: [
      { path: 'dia', component: VistaDiaComponent },
      { path: 'menu', component: VistaMenuComponent },
      { path: 'eventos', component: VistaEventosComponent },
      { path: 'carta', component: VistaCartaComponent },
      { path: '', redirectTo: 'dia', pathMatch: 'full' }
    ]
  },
  // Ruta independiente para diagnóstico
  { path: 'diagnostico', component: DiagnosticoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VistasRoutingModule { }