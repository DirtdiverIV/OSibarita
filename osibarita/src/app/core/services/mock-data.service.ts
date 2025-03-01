// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { MenuItem, Vista, ConfiguracionTV, Escena } from '../../models';
import { 
  Firestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  deleteDoc,
  writeBatch
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService
  ) { }

  // Inicializar datos mockup en Firestore
  async initializeMockData() {
    console.log('Inicializando datos mockup...');
    
    // Primero creamos el documento 'dia' dentro de la colección 'vistas'
    await this.createDocumentoVistaDia();
    
    // Luego inicializamos las colecciones
    await this.initializeVistas();
    await this.initializeMenuItems();
    await this.initializeEventos();
    await this.initializeCarta();
    await this.initializeConfiguracionTVs();
    
    console.log('Datos mockup inicializados correctamente');
  }

  // Crear el documento 'dia' explícitamente
  private async createDocumentoVistaDia() {
    try {
      const diaRef = doc(this.firestore, 'vistas', 'dia');
      await setDoc(diaRef, {
        id: 'dia',
        nombre: 'Vista del Día',
        descripcion: 'Muestra el menú y tapas del día',
        activa: true
      });
      console.log('Documento vistas/dia creado correctamente');
    } catch (error) {
      console.error('Error al crear documento vistas/dia:', error);
      throw error;
    }
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

    // Usar batch para escribir todas las vistas de una vez
    const batch = writeBatch(this.firestore);
    
    for (const vista of vistas) {
      const vistaRef = doc(this.firestore, 'vistas', vista.id);
      batch.set(vistaRef, vista);
    }
    
    await batch.commit();
    console.log('Vistas inicializadas correctamente');
  }

  // Inicializar items del menú usando el enfoque directo
  private async initializeMenuItems() {
    try {
      // Primero limpiamos las colecciones existentes
      await this.limpiarColeccion('vistas/dia/tapas');
      await this.limpiarColeccion('vistas/dia/raciones');
      await this.limpiarColeccion('vistas/dia/menu');
      
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

      // Inicializar en Firestore con operaciones directas
      const batchTapas = writeBatch(this.firestore);
      for (const tapa of tapas) {
        // Verificamos que id existe y es un string
        if (tapa.id) {
          const docRef = doc(this.firestore, 'vistas/dia/tapas', tapa.id);
          batchTapas.set(docRef, tapa);
        }
      }
      await batchTapas.commit();
      
      const batchRaciones = writeBatch(this.firestore);
      for (const racion of raciones) {
        // Verificamos que id existe y es un string
        if (racion.id) {
          const docRef = doc(this.firestore, 'vistas/dia/raciones', racion.id);
          batchRaciones.set(docRef, racion);
        }
      }
      await batchRaciones.commit();
      
      const batchMenu = writeBatch(this.firestore);
      for (const item of menuDia) {
        // Verificamos que id existe y es un string
        if (item.id) {
          const docRef = doc(this.firestore, 'vistas/dia/menu', item.id);
          batchMenu.set(docRef, item);
        }
      }
      await batchMenu.commit();
      
      console.log('Items del menú inicializados correctamente');
    } catch (error) {
      console.error('Error al inicializar items del menú:', error);
      throw error;
    }
  }

  // Limpiar colección antes de agregar nuevos datos
  private async limpiarColeccion(collectionPath: string) {
    try {
      const collectionRef = collection(this.firestore, collectionPath);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(this.firestore);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Colección ${collectionPath} limpiada correctamente`);
    } catch (error) {
      console.error(`Error al limpiar colección ${collectionPath}:`, error);
    }
  }

  // Inicializar eventos
  private async initializeEventos() {
    // Crear documento eventos si no existe
    await setDoc(doc(this.firestore, 'vistas', 'eventos'), {
      id: 'eventos',
      nombre: 'Vista de Eventos',
      descripcion: 'Muestra eventos próximos y promociones',
      activa: true
    });
    
    // Limpiar colección existente
    await this.limpiarColeccion('vistas/eventos/escenas');
    
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

    // Inicializar en Firestore con operaciones directas
    const batchEventos = writeBatch(this.firestore);
    for (const evento of eventos) {
      // Verificamos que id existe y es un string
      if (evento.id) {
        const docRef = doc(this.firestore, 'vistas/eventos/escenas', evento.id);
        batchEventos.set(docRef, evento);
      }
    }
    await batchEventos.commit();
    
    console.log('Eventos inicializados correctamente');
  }

  // Inicializar carta
  private async initializeCarta() {
    // Crear documento carta si no existe
    await setDoc(doc(this.firestore, 'vistas', 'carta'), {
      id: 'carta',
      nombre: 'Vista de Carta',
      descripcion: 'Muestra la carta completa del restaurante',
      activa: true
    });
    
    // Limpiar colección existente
    await this.limpiarColeccion('vistas/carta/escenas');
    
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

    // Inicializar en Firestore
    const batchCarta = writeBatch(this.firestore);
    for (const escena of cartaEscenas) {
      // Verificamos que id existe y es un string
      if (escena.id) {
        const docRef = doc(this.firestore, 'vistas/carta/escenas', escena.id);
        batchCarta.set(docRef, escena);
      }
    }
    await batchCarta.commit();
    
    console.log('Carta inicializada correctamente');
  }

  // Inicializar configuración de TVs
  private async initializeConfiguracionTVs() {
    // Limpiar colección existente
    await this.limpiarColeccion('configuracion');
    
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
    const batch = writeBatch(this.firestore);
    for (let i = 1; i <= 4; i++) {
      const config = {...configuraciones[i-1]};
      const docRef = doc(this.firestore, 'configuracion', `tv${i}`);
      batch.set(docRef, config);
    }
    await batch.commit();
    
    console.log('Configuración de TVs inicializada correctamente');
  }
}