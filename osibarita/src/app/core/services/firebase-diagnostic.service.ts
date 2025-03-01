// src/app/core/services/firebase-diagnostic.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc 
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDiagnosticService {

  constructor(private firestore: Firestore) { }

  async testFirebaseConnection(): Promise<boolean> {
    try {
      console.log('Probando conexión a Firebase...');
      // Intentar obtener una referencia a la base de datos
      const db = this.firestore;
      console.log('Firestore inicializado:', !!db);
      return !!db;
    } catch (error) {
      console.error('Error al probar conexión a Firebase:', error);
      return false;
    }
  }

  async checkCollections(): Promise<any> {
    try {
      const result: any = {
        colecciones: [],
        detalles: {}
      };

      // Verificar la colección vistas
      try {
        const vistasRef = collection(this.firestore, 'vistas');
        const vistasSnapshot = await getDocs(vistasRef);
        result.colecciones.push('vistas');
        result.detalles.vistas = {
          documentos: vistasSnapshot.size,
          datos: vistasSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        };
        console.log('Colección vistas:', result.detalles.vistas);
      } catch (error) {
        console.error('Error al verificar colección vistas:', error);
        result.detalles.vistas = { error: error };
      }

      // Verificar subcolecciones de vistas/dia
      try {
        // Comprobar si existe el documento día
        const diaRef = doc(this.firestore, 'vistas', 'dia');
        const diaDoc = await getDoc(diaRef);
        
        if (diaDoc.exists()) {
          // Verificar tapas
          try {
            const tapasRef = collection(this.firestore, 'vistas/dia/tapas');
            const tapasSnapshot = await getDocs(tapasRef);
            result.colecciones.push('vistas/dia/tapas');
            result.detalles.tapas = {
              documentos: tapasSnapshot.size,
              datos: tapasSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            };
            console.log('Colección tapas:', result.detalles.tapas);
          } catch (error) {
            console.error('Error al verificar colección tapas:', error);
            result.detalles.tapas = { error: error };
          }

          // Verificar raciones
          try {
            const racionesRef = collection(this.firestore, 'vistas/dia/raciones');
            const racionesSnapshot = await getDocs(racionesRef);
            result.colecciones.push('vistas/dia/raciones');
            result.detalles.raciones = {
              documentos: racionesSnapshot.size,
              datos: racionesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            };
            console.log('Colección raciones:', result.detalles.raciones);
          } catch (error) {
            console.error('Error al verificar colección raciones:', error);
            result.detalles.raciones = { error: error };
          }

          // Verificar menú
          try {
            const menuRef = collection(this.firestore, 'vistas/dia/menu');
            const menuSnapshot = await getDocs(menuRef);
            result.colecciones.push('vistas/dia/menu');
            result.detalles.menu = {
              documentos: menuSnapshot.size,
              datos: menuSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            };
            console.log('Colección menú:', result.detalles.menu);
          } catch (error) {
            console.error('Error al verificar colección menú:', error);
            result.detalles.menu = { error: error };
          }
        } else {
          console.error('El documento vistas/dia no existe');
          result.detalles.vistaDia = { error: 'No existe el documento' };
        }
      } catch (error) {
        console.error('Error al verificar documento día:', error);
        result.detalles.vistaDia = { error: error };
      }

      // Verificar configuración
      try {
        const configRef = collection(this.firestore, 'configuracion');
        const configSnapshot = await getDocs(configRef);
        result.colecciones.push('configuracion');
        result.detalles.configuracion = {
          documentos: configSnapshot.size,
          datos: configSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        };
        console.log('Colección configuración:', result.detalles.configuracion);
      } catch (error) {
        console.error('Error al verificar colección configuración:', error);
        result.detalles.configuracion = { error: error };
      }

      return result;
    } catch (error) {
      console.error('Error general en checkCollections:', error);
      return { error: error };
    }
  }
}