import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VistasService } from '../../../../core/services/vistas.service';
import { MenuItem, MenuDia, MenuDiaItem } from '../../../../models';
import { Observable, of, Subscription } from 'rxjs'; // Agregamos Subscription
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-menu-dia-editor',
  templateUrl: './menu-dia-editor.component.html',
  styleUrls: ['./menu-dia-editor.component.scss']
})
export class MenuDiaEditorComponent implements OnInit, OnDestroy { // Implementamos OnDestroy
  // Sección activa
  activeSection: 'menu' | 'tapas' | 'raciones' = 'menu';
  
  // Formularios
  menuForm: FormGroup;
  platoForm: FormGroup;
  tapaForm: FormGroup;
  racionForm: FormGroup;
  
  // Datos
  menuInfo$: Observable<MenuDia> = of({} as MenuDia);
  primerosPlatos$: Observable<MenuDiaItem[]> = of([]);
  segundosPlatos$: Observable<MenuDiaItem[]> = of([]);
  postres$: Observable<MenuDiaItem[]> = of([]);
  tapas$: Observable<MenuItem[]> = of([]);
  raciones$: Observable<MenuItem[]> = of([]);
  
  // Estado de edición
  editingPlato: MenuDiaItem | null = null;
  editingItem: MenuItem | null = null;
  
  // Estados
  loading = {
    menu: false,
    platos: false,
    tapas: false,
    raciones: false
  };
  saving = false;
  
  // Mensajes
  successMessage = '';
  errorMessage = '';
  
  // Inicializar subscription como Subscription
  private subscription = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private vistasService: VistasService
  ) {
    // Inicializar formularios
    this.menuForm = this.createMenuForm();
    this.platoForm = this.createPlatoForm();
    this.tapaForm = this.createItemForm();
    this.racionForm = this.createItemForm();
  }

  ngOnInit(): void {
    this.loadMenuData();
  }

  // Método para limpiar suscripciones
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Cambiar sección activa
  setActiveSection(section: 'menu' | 'tapas' | 'raciones'): void {
    this.activeSection = section;
    
    // Cargar datos según la sección
    switch (section) {
      case 'menu':
        this.loadMenuData();
        break;
      case 'tapas':
        this.loadTapas();
        break;
      case 'raciones':
        this.loadRaciones();
        break;
    }
    
    // Resetear mensajes
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Crear formulario para info del menú
  createMenuForm(): FormGroup {
    return this.fb.group({
      precio: [15.95, [Validators.required, Validators.min(0)]],
      descripcion: ['Menú del día incluye primer plato, segundo plato, postre, pan y bebida', Validators.maxLength(200)],
      disponible: [true]
    });
  }

  // Crear formulario para platos del menú
  createPlatoForm(): FormGroup {
    return this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['primeros', [Validators.required]]
    });
  }

  // Crear formulario para tapas y raciones
  createItemForm(): FormGroup {
    return this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''] // 'tapas' o 'raciones' dependiendo del tipo
    });
  }

  // Cargar datos del menú del día
  loadMenuData(): void {
    this.loading.menu = true;
    this.loading.platos = true;
    
    // Añadir una suscripción explícita para detener la carga
    this.subscription.add(
      this.vistasService.getMenuDiaInfo().pipe(
        tap(info => {
          if (info && info.precio) {
            this.menuForm.patchValue({
              precio: info.precio,
              descripcion: info.descripcion || '',
              disponible: info.disponible
            });
          }
          this.loading.menu = false;  // Importante: detener el estado de carga
        }),
        catchError(error => {
          console.error('Error al cargar información del menú:', error);
          this.errorMessage = 'Error al cargar información del menú';
          this.loading.menu = false;  // Importante: detener el estado de carga incluso si hay error
          return of({} as MenuDia);
        })
      ).subscribe()
    );
    
    // Cargar platos del menú
    this.vistasService.getMenuDiaPlatos().pipe(
      tap(platos => {
        // Filtrar por categorías
        this.primerosPlatos$ = of(platos.filter(p => p.category === 'primeros'));
        this.segundosPlatos$ = of(platos.filter(p => p.category === 'segundos'));
        this.postres$ = of(platos.filter(p => p.category === 'postres'));
        
        this.loading.platos = false;
      }),
      catchError(error => {
        console.error('Error al cargar platos del menú:', error);
        this.errorMessage = 'Error al cargar platos del menú';
        this.loading.platos = false;
        return of([]);
      })
    ).subscribe();
  }

  // Cargar tapas
  loadTapas(): void {
    this.loading.tapas = true;
    
    this.subscription.add(
      this.vistasService.getTapas().pipe(
        tap(tapas => {
          console.log('Tapas cargadas:', tapas);
          this.tapas$ = of(tapas);  // Actualiza el observable explícitamente
          this.loading.tapas = false;
        }),
        catchError(error => {
          console.error('Error al cargar tapas:', error);
          this.errorMessage = 'Error al cargar tapas';
          this.loading.tapas = false;
          return of([]);
        })
      ).subscribe()
    );
  }

  // Cargar raciones
  loadRaciones(): void {
    this.loading.raciones = true;
    
    this.subscription.add(
      this.vistasService.getRaciones().pipe(
        tap(raciones => {
          console.log('Raciones cargadas:', raciones);
          this.raciones$ = of(raciones);  // Actualiza el observable explícitamente
          this.loading.raciones = false;
        }),
        catchError(error => {
          console.error('Error al cargar raciones:', error);
          this.errorMessage = 'Error al cargar raciones';
          this.loading.raciones = false;
          return of([]);
        })
      ).subscribe()
    );
  }

  // Guardar información del menú
  saveMenuInfo(): void {
    if (this.menuForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const menuData: Partial<MenuDia> = {
      precio: this.menuForm.value.precio,
      descripcion: this.menuForm.value.descripcion,
      disponible: this.menuForm.value.disponible
    };
    
    this.vistasService.updateMenuDiaInfo(menuData)
      .then(() => {
        this.successMessage = 'Información del menú actualizada correctamente';
        this.saving = false;
      })
      .catch(error => {
        console.error('Error al guardar información del menú:', error);
        this.errorMessage = 'Error al guardar información del menú';
        this.saving = false;
      });
  }

  // Iniciar edición de un plato
  editPlato(plato: MenuDiaItem): void {
    this.editingPlato = plato;
    this.platoForm.patchValue({
      id: plato.id,
      name: plato.name,
      description: plato.description,
      category: plato.category
    });
  }

  // Guardar un plato (nuevo o editado)
  savePlato(): void {
    if (this.platoForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const platoData = this.platoForm.value;
    
    // Si tiene ID es una edición, sino es nuevo
    if (platoData.id) {
      // Editar plato existente
      this.vistasService.updateMenuDiaPlato(platoData.id, {
        name: platoData.name,
        description: platoData.description,
        category: platoData.category
      })
        .then(() => {
          this.successMessage = 'Plato actualizado correctamente';
          this.saving = false;
          this.cancelEditPlato();
          this.loadMenuData(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al actualizar plato:', error);
          this.errorMessage = 'Error al actualizar plato';
          this.saving = false;
        });
    } else {
      // Añadir nuevo plato
      this.vistasService.addMenuDiaPlato({
        name: platoData.name,
        description: platoData.description,
        category: platoData.category
      })
        .then(() => {
          this.successMessage = 'Plato añadido correctamente';
          this.saving = false;
          this.cancelEditPlato();
          this.loadMenuData(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al añadir plato:', error);
          this.errorMessage = 'Error al añadir plato';
          this.saving = false;
        });
    }
  }

  // Cancelar edición de plato
  cancelEditPlato(): void {
    this.editingPlato = null;
    this.platoForm.reset({
      id: '',
      name: '',
      description: '',
      category: 'primeros'
    });
  }

  // Eliminar un plato
  deletePlato(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      this.vistasService.deleteMenuDiaPlato(id)
        .then(() => {
          this.successMessage = 'Plato eliminado correctamente';
          this.loadMenuData(); // Recargar datos
        })
        .catch(error => {
          console.error('Error al eliminar plato:', error);
          this.errorMessage = 'Error al eliminar plato';
        });
    }
  }

  // Iniciar edición de un ítem (tapa o ración)
  editItem(item: MenuItem, type: 'tapas' | 'raciones'): void {
    this.editingItem = item;
    
    const form = type === 'tapas' ? this.tapaForm : this.racionForm;
    
    form.patchValue({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: type
    });
  }

  // Guardar un ítem (tapa o ración, nuevo o editado)
  saveItem(type: 'tapas' | 'raciones'): void {
    const form = type === 'tapas' ? this.tapaForm : this.racionForm;
    
    if (form.invalid) {
      return;
    }
    
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const itemData = form.value;
    itemData.category = type; // Asegurar que la categoría es correcta
    
    // Si tiene ID es una edición, sino es nuevo
    if (itemData.id) {
      // Editar ítem existente
      this.vistasService.updateMenuItem(type, itemData.id, {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: type
      })
        .then(() => {
          this.successMessage = `${type === 'tapas' ? 'Tapa' : 'Ración'} actualizada correctamente`;
          this.saving = false;
          this.cancelEditItem(type);
          type === 'tapas' ? this.loadTapas() : this.loadRaciones(); // Recargar datos
        })
        .catch(error => {
          console.error(`Error al actualizar ${type}:`, error);
          this.errorMessage = `Error al actualizar ${type === 'tapas' ? 'tapa' : 'ración'}`;
          this.saving = false;
        });
    } else {
      // Añadir nuevo ítem
      this.vistasService.addMenuItem(type, {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: type
      })
        .then(() => {
          this.successMessage = `${type === 'tapas' ? 'Tapa' : 'Ración'} añadida correctamente`;
          this.saving = false;
          this.cancelEditItem(type);
          type === 'tapas' ? this.loadTapas() : this.loadRaciones(); // Recargar datos
        })
        .catch(error => {
          console.error(`Error al añadir ${type}:`, error);
          this.errorMessage = `Error al añadir ${type === 'tapas' ? 'tapa' : 'ración'}`;
          this.saving = false;
        });
    }
  }

  // Iniciar creación de un nuevo plato
initNewPlato(): void {
    this.platoForm.reset({
      id: '',
      name: '',
      description: '',
      category: 'primeros'
    });
    // Crear un objeto de tipo MenuDiaItem para edición
    this.editingPlato = {
      name: '',
      description: '',
      category: 'primeros'
    };
  }
  
  // Iniciar creación de una nueva tapa
  initNewTapa(): void {
    this.tapaForm.reset({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'tapas'
    });
    // Crear un objeto de tipo MenuItem para edición
    this.editingItem = {
      name: '',
      description: '',
      price: 0,
      category: 'tapas'
    };
  }
  
  // Iniciar creación de una nueva ración
  initNewRacion(): void {
    this.racionForm.reset({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'raciones'
    });
    // Crear un objeto de tipo MenuItem para edición
    this.editingItem = {
      name: '',
      description: '',
      price: 0,
      category: 'raciones'
    };
  }

  // Cancelar edición de ítem
  cancelEditItem(type: 'tapas' | 'raciones'): void {
    this.editingItem = null;
    
    const form = type === 'tapas' ? this.tapaForm : this.racionForm;
    
    form.reset({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: type
    });
  }

  // Eliminar un ítem
  deleteItem(id: string, type: 'tapas' | 'raciones'): void {
    if (confirm(`¿Estás seguro de que deseas eliminar esta ${type === 'tapas' ? 'tapa' : 'ración'}?`)) {
      this.vistasService.deleteMenuItem(type, id)
        .then(() => {
          this.successMessage = `${type === 'tapas' ? 'Tapa' : 'Ración'} eliminada correctamente`;
          type === 'tapas' ? this.loadTapas() : this.loadRaciones(); // Recargar datos
        })
        .catch(error => {
          console.error(`Error al eliminar ${type}:`, error);
          this.errorMessage = `Error al eliminar ${type === 'tapas' ? 'tapa' : 'ración'}`;
        });
    }
  }
}