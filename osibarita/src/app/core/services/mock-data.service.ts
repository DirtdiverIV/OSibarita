// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { MenuItem, Vista, ConfiguracionTV, Escena } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor(private firestoreService: FirestoreService) { }

  // Inicializar datos mockup en Firestore
  async initializeMockData() {
    await this.initializeVistas();
    await this.initializeMenuItems();
    await this.initializeEventos();
    await this.initializeCarta();
    await this.initializeConfiguracionTVs();
    
    console.log('Datos mockup inicializados correctamente');
  }

  // Inicializar vistas
  private async initializeVistas() {
    const vistas: Vista[] = [
      {
        id: 'dia',
        nombre: 'Vista del Día',
        descripcion: 'Muestra el menú y tapas del día',
        activa: true
      },
      {
        id: 'menu',
        nombre: 'Vista de Menú',
        descripcion: 'Muestra el menú completo',
        activa: true
      },
      {
        id: 'eventos',
        nombre: 'Vista de Eventos',
        descripcion: 'Muestra eventos próximos y promociones',
        activa: true
      },
      {
        id: 'carta',
        nombre: 'Vista de Carta',
        descripcion: 'Muestra la carta completa del restaurante',
        activa: true
      }
    ];

    await this.firestoreService.initializeCollection('vistas', vistas);
  }

  // Inicializar items del menú
  private async initializeMenuItems() {
    // Tapas
    const tapas: MenuItem[] = [
      {
        id: 'tapa1',
        name: 'Tortilla Española',
        description: 'Tortilla de patata con cebolla',
        price: 3.5,
        category: 'tapas'
      },
      {
        id: 'tapa2',
        name: 'Croquetas de Jamón',
        description: 'Croquetas caseras de jamón ibérico',
        price: 4.0,
        category: 'tapas'
      },
      {
        id: 'tapa3',
        name: 'Gambas al Ajillo',
        description: 'Gambas salteadas con ajo y guindilla',
        price: 5.5,
        category: 'tapas'
      }
    ];

    // Raciones
    const raciones: MenuItem[] = [
      {
        id: 'racion1',
        name: 'Pulpo a la Gallega',
        description: 'Pulpo cocido con pimentón y aceite de oliva',
        price: 14.5,
        category: 'raciones'
      },
      {
        id: 'racion2',
        name: 'Tabla de Quesos',
        description: 'Selección de quesos nacionales con membrillo',
        price: 12.0,
        category: 'raciones'
      },
      {
        id: 'racion3',
        name: 'Parrillada de Verduras',
        description: 'Verduras de temporada a la parrilla',
        price: 9.5,
        category: 'raciones'
      }
    ];

    // Menú del día
    const menuDia: MenuItem[] = [
      {
        id: 'menuPrimero1',
        name: 'Ensalada Mixta',
        description: 'Lechuga, tomate, cebolla, atún y huevo',
        price: 6.0,
        category: 'primeros'
      },
      {
        id: 'menuPrimero2',
        name: 'Sopa de Pescado',
        description: 'Sopa casera con pescado de roca',
        price: 7.0,
        category: 'primeros'
      },
      {
        id: 'menuSegundo1',
        name: 'Merluza a la Romana',
        description: 'Merluza fresca rebozada con ensalada',
        price: 12.0,
        category: 'segundos'
      },
      {
        id: 'menuSegundo2',
        name: 'Entrecot de Ternera',
        description: 'Entrecot de ternera con patatas fritas',
        price: 14.0,
        category: 'segundos'
      },
      {
        id: 'menuPostre1',
        name: 'Flan Casero',
        description: 'Flan con caramelo y nata',
        price: 4.0,
        category: 'postres'
      },
      {
        id: 'menuPostre2',
        name: 'Fruta del Tiempo',
        description: 'Selección de frutas de temporada',
        price: 3.5,
        category: 'postres'
      }
    ];

    // Inicializar en Firestore
    await this.firestoreService.initializeCollection('vistas/dia/tapas', tapas);
    await this.firestoreService.initializeCollection('vistas/dia/raciones', raciones);
    await this.firestoreService.initializeCollection('vistas/dia/menu', menuDia);
  }

  // Inicializar eventos
  private async initializeEventos() {
    const eventos: Escena[] = [
      {
        id: 'evento1',
        titulo: 'Noche de Flamenco',
        descripcion: 'Todos los viernes noche, espectáculo de flamenco en directo',
        contenido: {
          imagen: 'assets/eventos/flamenco.jpg',
          fecha: '2025-03-07',
          hora: '21:00',
          precio: 15
        },
        duracion: 20,
        orden: 1
      },
      {
        id: 'evento2',
        titulo: 'Degustación de Vinos',
        descripcion: 'Cata de vinos de la Ribera del Duero con maridaje',
        contenido: {
          imagen: 'assets/eventos/vinos.jpg',
          fecha: '2025-03-15',
          hora: '19:00',
          precio: 25
        },
        duracion: 20,
        orden: 2
      },
      {
        id: 'evento3',
        titulo: 'Menú Especial Semana Santa',
        descripcion: 'Disfruta de nuestro menú especial de Semana Santa',
        contenido: {
          imagen: 'assets/eventos/semana-santa.jpg',
          fechaInicio: '2025-04-01',
          fechaFin: '2025-04-07',
          precio: 30
        },
        duracion: 20,
        orden: 3
      }
    ];

    await this.firestoreService.initializeCollection('vistas/eventos/escenas', eventos);
  }

  // Inicializar carta
  private async initializeCarta() {
    const cartaEscenas: Escena[] = [
      {
        id: 'carta1',
        titulo: 'Entrantes',
        descripcion: 'Selección de entrantes',
        contenido: {
          items: [
            {
              nombre: 'Jamón Ibérico',
              descripcion: 'Jamón ibérico de bellota cortado a mano',
              precio: 22
            },
            {
              nombre: 'Anchoas del Cantábrico',
              descripcion: 'Anchoas del Cantábrico con AOVE',
              precio: 18
            },
            {
              nombre: 'Carpaccio de Ternera',
              descripcion: 'Carpaccio de ternera con parmesano y rúcula',
              precio: 16
            }
          ]
        },
        duracion: 30,
        orden: 1
      },
      {
        id: 'carta2',
        titulo: 'Pescados',
        descripcion: 'Nuestros mejores pescados',
        contenido: {
          items: [
            {
              nombre: 'Lubina a la Sal',
              descripcion: 'Lubina fresca cocinada en costra de sal',
              precio: 24
            },
            {
              nombre: 'Bacalao Confitado',
              descripcion: 'Bacalao confitado con alioli de ajo negro',
              precio: 22
            },
            {
              nombre: 'Pulpo a la Brasa',
              descripcion: 'Pulpo braseado con puré de patata',
              precio: 26
            }
          ]
        },
        duracion: 30,
        orden: 2
      },
      {
        id: 'carta3',
        titulo: 'Carnes',
        descripcion: 'Selección de carnes',
        contenido: {
          items: [
            {
              nombre: 'Chuletón de Vaca Madurada',
              descripcion: 'Chuletón de vaca madurada 45 días (500g)',
              precio: 35
            },
            {
              nombre: 'Solomillo de Ternera',
              descripcion: 'Solomillo de ternera con salsa de boletus',
              precio: 28
            },
            {
              nombre: 'Cochinillo Confitado',
              descripcion: 'Cochinillo confitado a baja temperatura',
              precio: 26
            }
          ]
        },
        duracion: 30,
        orden: 3
      }
    ];

    await this.firestoreService.initializeCollection('vistas/carta/escenas', cartaEscenas);
  }

  // Inicializar configuración de TVs
  private async initializeConfiguracionTVs() {
    const configuraciones: ConfiguracionTV[] = [
      {
        vista: 'dia',
        temporizador: 30,
        ultimaActualizacion: new Date()
      },
      {
        vista: 'menu',
        temporizador: 40,
        ultimaActualizacion: new Date()
      },
      {
        vista: 'eventos',
        temporizador: 20,
        ultimaActualizacion: new Date()
      },
      {
        vista: 'carta',
        temporizador: 30,
        ultimaActualizacion: new Date()
      }
    ];

    // Configuración para cada TV
    for (let i = 1; i <= 4; i++) {
      const config = {...configuraciones[i-1]};
      await this.firestoreService.setDoc('configuracion', `tv${i}`, config);
    }
  }
}