// src/app/features/vistas/vistas-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistaDiaComponent } from './pages/vista-dia/vista-dia.component';
import { TvLayoutComponent } from './pages/tv-layout/tv-layout.component';

// Importaremos los componentes adicionales a medida que los creemos
// import { VistaMenuComponent } from './pages/vista-menu/vista-menu.component';
// import { VistaEventosComponent } from './pages/vista-eventos/vista-eventos.component';
// import { VistaCartaComponent } from './pages/vista-carta/vista-carta.component';

const routes: Routes = [
  {
    path: '',
    component: TvLayoutComponent,
    children: [
      { path: 'dia', component: VistaDiaComponent },
      // { path: 'menu', component: VistaMenuComponent },
      // { path: 'eventos', component: VistaEventosComponent },
      // { path: 'carta', component: VistaCartaComponent },
      { path: '', redirectTo: 'dia', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VistasRoutingModule { }