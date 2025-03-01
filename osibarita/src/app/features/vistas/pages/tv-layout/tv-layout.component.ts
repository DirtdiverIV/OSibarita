// src/app/features/vistas/pages/tv-layout/tv-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VistasService } from '../../../../core/services/vistas.service';
import { ConfiguracionTV } from '../../../../models';

@Component({
  selector: 'app-tv-layout',
  templateUrl: './tv-layout.component.html',
  styleUrls: ['./tv-layout.component.scss']
})
export class TvLayoutComponent implements OnInit, OnDestroy {
  tvId: string = 'tv1'; // Por defecto es tv1
  configuracion: ConfiguracionTV | null = null;
  private configSubscription?: Subscription;
  private timerInterval?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vistasService: VistasService
  ) {}

  ngOnInit(): void {
    // Obtener el parámetro tv de la URL (ejemplo: ?tv=2)
    this.route.queryParams.subscribe(params => {
      if (params['tv']) {
        this.tvId = `tv${params['tv']}`;
      }
      this.cargarConfiguracion();
    });
  }

  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private cargarConfiguracion(): void {
    // Cancelar la suscripción anterior si existe
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    
    // Suscribirse a los cambios de configuración para este TV
    this.configSubscription = this.vistasService.getConfiguracionTV(this.tvId).subscribe(
      (config) => {
        this.configuracion = config;
        this.navegarAVistaActual();
        this.configurarTemporizador();
      },
      (error) => {
        console.error(`Error al cargar configuración para ${this.tvId}:`, error);
      }
    );
  }

  private navegarAVistaActual(): void {
    if (this.configuracion && this.configuracion.vista) {
      this.router.navigate(['/tv', this.configuracion.vista]);
    }
  }

  private configurarTemporizador(): void {
    // Limpiar el temporizador existente si lo hay
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // No configurar temporizador si no hay configuración o no hay temporizador establecido
    if (!this.configuracion || !this.configuracion.temporizador) {
      return;
    }
    
    // Configurar nuevo temporizador (en milisegundos)
    const tiempoTemporizador = this.configuracion.temporizador * 1000;
    
    // Establecer un intervalo para cambiar de vista
    this.timerInterval = setInterval(() => {
      // Aquí se puede implementar lógica adicional para rotación de vistas
      // Por ahora, simplemente se recargará la vista actual para simular una actualización
      this.navegarAVistaActual();
    }, tiempoTemporizador);
  }
}