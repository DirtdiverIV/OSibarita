
// src/app/features/admin/components/carta-editor/carta-editor.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VistasService } from '../../../../core/services/vistas.service';
import { Escena } from '../../../../models';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-carta-editor',
  templateUrl: './carta-editor.component.html',
  styleUrls: ['./carta-editor.component.scss']
})
export class CartaEditorComponent implements OnInit {
  // Formularios
  escenaForm: FormGroup;
  itemForm: FormGroup;
  
  // Datos
  escenas$: Observable<Escena[]> = of([]);
  
  // Estados de edición
  editingEscena: Escena | null = null;
  editingItem: boolean = false;
  editingItemIndex: number = -1;
  
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
    // Inicializar formularios
    this.escenaForm = this.createEscenaForm();
    this.itemForm = this.createItemForm();
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
      duracion: [30, [Validators.required, Validators.min(5), Validators.max(300)]],
      orden: [1, [Validators.required, Validators.min(1)]],
      items: this.fb.array([])
    });
  }

  // Crear formulario para item de la carta
  createItemForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
  }

  // Acceso al FormArray de items
  get items(): FormArray {
    return this.escenaForm.get('items') as FormArray;
  }

  // Cargar escenas
  loadEscenas(): void {
    this.loading = true;
    
    this.escenas$ = this.vistasService.getEscenasCarta().pipe(
      tap(escenas => {
        console.log('Escenas de carta cargadas:', escenas);
        this.loading = false;
      }),
      catchError(error => {
        console.error('Error al cargar escenas de carta:', error);
        this.errorMessage = 'Error al cargar escenas de carta';
        this.loading = false;
        return of([]);
      })
    );
  }

  // Iniciar edición de una escena
  editEscena(escena: Escena): void {
    this.editingEscena = escena;
    
    // Limpiar el array de items
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    
    // Preparar datos para el formulario
    const formData = {
      id: escena.id,
      titulo: escena.titulo,
      descripcion: escena.descripcion || '',
      duracion: escena.duracion,
      orden: escena.orden
    };
    
    this.escenaForm.patchValue(formData);
    
    // Añadir items al formulario si existen
    if (escena.contenido?.items && Array.isArray(escena.contenido.items)) {
      escena.contenido.items.forEach((item: { nombre: any; descripcion: any; precio: any; }) => {
        this.items.push(this.fb.group({
          nombre: [item.nombre, [Validators.required, Validators.maxLength(50)]],
          descripcion: [item.descripcion, [Validators.required, Validators.maxLength(200)]],
          precio: [item.precio, [Validators.required, Validators.min(0)]]
        }));
      });
    }
  }

  // Cancelar edición de escena
  cancelEdit(): void {
    this.editingEscena = null;
    this.escenaForm.reset({
      id: '',
      titulo: '',
      descripcion: '',
      duracion: 30,
      orden: 1
    });
    
    // Limpiar el array de items
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    
    // Cancelar cualquier edición de item
    this.cancelEditItem();
  }

  // Iniciar edición de un item
  editItem(index: number): void {
    this.editingItem = true;
    this.editingItemIndex = index;
    
    const item = this.items.at(index);
    this.itemForm.patchValue({
      nombre: item.value.nombre,
      descripcion: item.value.descripcion,
      precio: item.value.precio
    });
  }

  // Cancelar edición de item
  cancelEditItem(): void {
    this.editingItem = false;
    this.editingItemIndex = -1;
    this.itemForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0
    });
  }

  // Añadir un nuevo item
  addItem(): void {
    if (this.itemForm.invalid) {
      return;
    }
    
    if (this.editingItemIndex >= 0) {
      // Actualizar item existente
      this.items.at(this.editingItemIndex).patchValue(this.itemForm.value);
    } else {
      // Añadir nuevo item
      this.items.push(this.fb.group({
        nombre: [this.itemForm.value.nombre, [Validators.required, Validators.maxLength(50)]],
        descripcion: [this.itemForm.value.descripcion, [Validators.required, Validators.maxLength(200)]],
        precio: [this.itemForm.value.precio, [Validators.required, Validators.min(0)]]
      }));
    }
    
    // Cancelar edición
    this.cancelEditItem();
  }

  // Eliminar un item
  removeItem(index: number): void {
    this.items.removeAt(index);
    
    // Si estábamos editando este item, cancelar edición
    if (this.editingItemIndex === index) {
      this.cancelEditItem();
    }
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
        items: formValue.items
      }
    };
    
    // Si tiene ID es una edición, sino es nueva
    if (formValue.id) {
      // Editar escena existente
      this.vistasService.updateEscena('carta', formValue.id, escenaData)
        .then(() => {
          this.successMessage = 'Sección de carta actualizada correctamente';
          this.saving = false;
          this.cancelEdit();
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al actualizar sección de carta:', error);
          this.errorMessage = 'Error al actualizar sección de carta';
          this.saving = false;
        });
    } else {
      // Añadir nueva escena
      this.vistasService.addEscena('carta', escenaData as Escena)
        .then(() => {
          this.successMessage = 'Sección de carta añadida correctamente';
          this.saving = false;
          this.cancelEdit();
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al añadir sección de carta:', error);
          this.errorMessage = 'Error al añadir sección de carta';
          this.saving = false;
        });
    }
  }

  // Eliminar una escena
  deleteEscena(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta sección de la carta?')) {
      this.vistasService.deleteEscena('carta', id)
        .then(() => {
          this.successMessage = 'Sección de carta eliminada correctamente';
          this.loadEscenas(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al eliminar sección de carta:', error);
          this.errorMessage = 'Error al eliminar sección de carta';
        });
    }
  }

  // Reordenar escenas
  reordenarEscenas(escenas: Escena[]): void {
    // Asignar nuevos valores de orden
    const escenasOrdenadas = escenas.map((escena, index) => {
      return { ...escena, orden: index + 1 };
    });
    
    this.vistasService.reordenarEscenas('carta', escenasOrdenadas)
      .then(() => {
        this.successMessage = 'Secciones de carta reordenadas correctamente';
        this.loadEscenas(); // Recargar datos
      })
      .catch(error => {
        console.error('Error al reordenar secciones de carta:', error);
        this.errorMessage = 'Error al reordenar secciones de carta';
      });
  }
}