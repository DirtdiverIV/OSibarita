// src/app/features/vistas/pages/tv-layout/tv-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
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
  currentVista: string = ''; // Para rastrear la vista actual
  private configSubscription?: Subscription;
  private routerSubscription?: Subscription;
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

    // Suscribirse a los eventos de navegación para detectar cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Extraer la vista actual de la URL
        const url = event.url;
        const match = url.match(/\/tv\/([^?]+)/);
        if (match && match[1]) {
          this.currentVista = match[1];
        }
      });
  }

  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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
        // Solo actualizar la configuración si es diferente
        if (!this.configuracion || 
            this.configuracion.vista !== config.vista || 
            this.configuracion.temporizador !== config.temporizador) {
          
          console.log(`[TV-Layout] Configuración actualizada para ${this.tvId}:`, config);
          this.configuracion = config;
          this.navegarAVistaActual();
          this.configurarTemporizador();
        }
      },
      (error) => {
        console.error(`Error al cargar configuración para ${this.tvId}:`, error);
      }
    );
  }

  private navegarAVistaActual(): void {
    if (this.configuracion && this.configuracion.vista) {
      const vistaActual = this.currentVista;
      const vistaNueva = this.configuracion.vista;
      
      // Solo navegar si la vista realmente ha cambiado
      if (vistaActual !== vistaNueva) {
        console.log(`[TV-Layout] Navegando de vista '${vistaActual}' a '${vistaNueva}'`);
        const targetUrl = `/tv/${vistaNueva}`;
        this.router.navigate([targetUrl], { queryParams: { tv: this.tvId.replace('tv', '') } });
      }
    }
  }

  private configurarTemporizador(): void {
    // Limpiar el temporizador existente si lo hay
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    
    // No configurar temporizador si no hay configuración o no hay temporizador establecido
    if (!this.configuracion || !this.configuracion.temporizador) {
      return;
    }
    
    // Configurar nuevo temporizador (en milisegundos)
    // Aumentamos a un minuto como mínimo para reducir las peticiones
    const tiempoTemporizador = Math.max(60, this.configuracion.temporizador) * 1000;
    
    console.log(`[TV-Layout] Configurando temporizador: ${tiempoTemporizador / 1000} segundos`);
    
    // Establecer un intervalo para actualizar la vista
    this.timerInterval = setInterval(() => {
      console.log('[TV-Layout] Ejecutando actualización por temporizador');
      // Aquí solo recargamos la configuración, no navegamos directamente
      // Esto evita navegaciones innecesarias si la config no ha cambiado
      this.cargarConfiguracion();
    }, tiempoTemporizador);
  }}