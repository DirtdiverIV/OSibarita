// src/app/features/admin/pages/configuracion/configuracion.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VistasService } from '../../../../core/services/vistas.service';
import { Vista, ConfiguracionTV } from '../../../../models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  // Formularios de configuración para cada TV
  formTV1: FormGroup;
  formTV2: FormGroup;
  formTV3: FormGroup;
  formTV4: FormGroup;
  
  // Datos desde Firebase
  vistas$: Observable<Vista[]> = of([]);
  configTV1$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV2$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV3$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  configTV4$: Observable<ConfiguracionTV> = of({} as ConfiguracionTV);
  
  // Estado de carga y mensajes
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private vistasService: VistasService
  ) {
    // Inicializar formularios
    this.formTV1 = this.crearFormulario();
    this.formTV2 = this.crearFormulario();
    this.formTV3 = this.crearFormulario();
    this.formTV4 = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Crear formulario base
  crearFormulario(): FormGroup {
    return this.fb.group({
      vista: ['', Validators.required],
      temporizador: [30, [Validators.required, Validators.min(5), Validators.max(300)]]
    });
  }

  cargarDatos(): void {
    this.loading = true;
    
    // Cargar vistas disponibles
    this.vistas$ = this.vistasService.getVistas().pipe(
      catchError(error => {
        console.error('Error al cargar vistas:', error);
        this.errorMessage = 'Error al cargar vistas';
        return of([]);
      })
    );
    
    // Cargar configuración de cada TV
    this.configTV1$ = this.vistasService.getConfiguracionTV('tv1').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV1:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV2$ = this.vistasService.getConfiguracionTV('tv2').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV2:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV3$ = this.vistasService.getConfiguracionTV('tv3').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV3:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    this.configTV4$ = this.vistasService.getConfiguracionTV('tv4').pipe(
      catchError(error => {
        console.error('Error al cargar configuración de TV4:', error);
        return of({} as ConfiguracionTV);
      })
    );
    
    // Suscribirse a las configuraciones para actualizar los formularios
    this.configTV1$.subscribe(config => {
      if (config && config.vista) {
        this.formTV1.patchValue({
          vista: config.vista,
          temporizador: config.temporizador
        });
      }
      this.loading = false;
    });
    
    this.configTV2$.subscribe(config => {
      if (config && config.vista) {
        this.formTV2.patchValue({
          vista: config.vista,
          temporizador: config.temporizador
        });
      }
    });
    
    this.configTV3$.subscribe(config => {
      if (config && config.vista) {
        this.formTV3.patchValue({
          vista: config.vista,
          temporizador: config.temporizador
        });
      }
    });
    
    this.configTV4$.subscribe(config => {
      if (config && config.vista) {
        this.formTV4.patchValue({
          vista: config.vista,
          temporizador: config.temporizador
        });
      }
      this.loading = false;
    });
  }

  // Guardar configuración para una TV específica
  async guardarConfiguracion(tvId: string, form: FormGroup): Promise<void> {
    if (form.invalid) {
      return;
    }
    
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    try {
      await this.vistasService.updateConfiguracionTV(tvId, {
        vista: form.value.vista,
        temporizador: form.value.temporizador
      });
      
      this.successMessage = `Configuración de ${tvId.toUpperCase()} actualizada correctamente`;
    } catch (error) {
      console.error(`Error al guardar configuración de ${tvId}:`, error);
      this.errorMessage = `Error al guardar configuración de ${tvId}`;
    } finally {
      this.saving = false;
      
      // Limpiar mensaje de éxito después de 3 segundos
      if (this.successMessage) {
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    }
  }

  // Abrir TV en nueva ventana
  abrirTV(tvId: number): void {
    window.open(`/tv?tv=${tvId}`, `_blank_tv${tvId}`);
  }
}