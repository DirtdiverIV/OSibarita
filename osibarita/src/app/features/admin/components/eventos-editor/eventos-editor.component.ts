// src/app/features/admin/components/eventos-editor/eventos-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-eventos-editor',
  templateUrl: './eventos-editor.component.html',
  styleUrls: ['./eventos-editor.component.scss']
})
export class EventosEditorComponent implements OnInit {
  // Formulario
  escenaForm: FormGroup;
  
  // Datos
  escenas$: Observable<Escena[]> = of([]);
  
  // Estado de edición
  editingEscena: Escena | null = null;
  
  // Estados
  loading = false;
  saving = false;
  
  // Mensajes
  successMessage = '';
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private vistasService: VistasService
  ) {
    // Inicializar formulario
    this.escenaForm = this.createEscenaForm();
  }

  ngOnInit(): void {
    this.loadEscenas();
  }

  // Crear formulario para escenas
  createEscenaForm(): FormGroup {
    return this.fb.group({
      id: [''],
      titulo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      duracion: [20, [Validators.required, Validators.min(5), Validators.max(300)]],
      orden: [1, [Validators.required, Validators.min(1)]],
      // Datos específicos para eventos
      'contenido.mensaje': ['', [Validators.maxLength(200)]],
      'contenido.precio': [null, [Validators.min(0)]]
    });
  }

  // Cargar escenas
  loadEscenas(): void {
    this.loading = true;
    
    this.escenas$ = this.vistasService.getEscenasEventos().pipe(
      tap(escenas => {
        console.log('Escenas cargadas:', escenas);
        this.loading = false;
      }),
      catchError(error => {
        console.error('Error al cargar escenas:', error);
        this.errorMessage = 'Error al cargar escenas de eventos';
        this.loading = false;
        return of([]);
      })
    );
  }

  // Iniciar edición de una escena
  editEscena(escena: Escena): void {
    this.editingEscena = escena;
    
    // Preparar datos para el formulario
    const formData = {
      id: escena.id,
      titulo: escena.titulo,
      descripcion: escena.descripcion || '',
      duracion: escena.duracion,
      orden: escena.orden,
      'contenido.mensaje': escena.contenido?.mensaje || '',
      'contenido.precio': escena.contenido?.precio || null
    };
    
    this.escenaForm.patchValue(formData);
  }

  // Guardar una escena (nueva o editada)
  saveEscena(): void {
    if (this.escenaForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const formValue = this.escenaForm.value;
    
    // Construir objeto de escena
    const escenaData: Partial<Escena> = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      duracion: formValue.duracion,
      orden: formValue.orden,
      contenido: {
        mensaje: formValue['contenido.mensaje'],
        precio: formValue['contenido.precio']
      }
    };
    
    // Si tiene ID es una edición, sino es nueva
    if (formValue.id) {
      // Editar escena existente
      this.vistasService.updateEscena('eventos', formValue.id, escenaData)
        .then(() => {
          this.successMessage = 'Escena actualizada correctamente';
          this.saving = false;
          this.cancelEdit();
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al actualizar escena:', error);
          this.errorMessage = 'Error al actualizar escena';
          this.saving = false;
        });
    } else {
      // Añadir nueva escena
      // src/app/features/admin/components/eventos-editor/eventos-editor.component.ts (continuación)
      // Añadir nueva escena
      this.vistasService.addEscena('eventos', escenaData as Escena)
        .then(() => {
          this.successMessage = 'Escena añadida correctamente';
          this.saving = false;
          this.cancelEdit();
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al añadir escena:', error);
          this.errorMessage = 'Error al añadir escena';
          this.saving = false;
        });
    }
  }

  // Cancelar edición
  cancelEdit(): void {
    this.editingEscena = null;
    this.escenaForm.reset({
      id: '',
      titulo: '',
      descripcion: '',
      duracion: 20,
      orden: 1,
      'contenido.mensaje': '',
      'contenido.precio': null
    });
  }

  // Eliminar una escena
  deleteEscena(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta escena?')) {
      this.vistasService.deleteEscena('eventos', id)
        .then(() => {
          this.successMessage = 'Escena eliminada correctamente';
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al eliminar escena:', error);
          this.errorMessage = 'Error al eliminar escena';
        });
    }
  }

  // Reordenar escenas
  reordenarEscenas(escenas: Escena[]): void {
    // Asignar nuevos valores de orden
    const escenasOrdenadas = escenas.map((escena, index) => {
      return { ...escena, orden: index + 1 };
    });
    
    this.vistasService.reordenarEscenas('eventos', escenasOrdenadas)
      .then(() => {
        this.successMessage = 'Escenas reordenadas correctamente';
        this.loadEscenas(); // Recargar datos
      })
      .catch(error => {
        console.error('Error al reordenar escenas:', error);
        this.errorMessage = 'Error al reordenar escenas';
      });
  }
}