// src/app/core/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection,
  query,
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  where, 
  onSnapshot, 
  collectionData
} from '@angular/fire/firestore';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // Obtener colección con actualizaciones en tiempo real
  getCollection<T>(collectionPath: string): Observable<T[]> {
    console.log(`Obteniendo colección: ${collectionPath}`);
    
    try {
      // Usamos un enfoque diferente para resolver el problema del tipo
      const collectionRef = collection(this.firestore, collectionPath);
      const q = query(collectionRef);
      
      // Crear observable manualmente en lugar de usar collectionData
      return new Observable<T[]>(observer => {
        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            const items: T[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as T);
            });
            observer.next(items);
          },
          (error) => {
            console.error(`Error en getCollection para ${collectionPath}:`, error);
            observer.error(error);
          }
        );
        
        // Cleanup function
        return { unsubscribe };
      }).pipe(
        catchError(error => {
          console.error(`Error al obtener colección ${collectionPath}:`, error);
          return of([] as T[]); // Retornar un array vacío en caso de error
        })
      );
    } catch (error) {
      console.error(`Error al configurar observable para colección ${collectionPath}:`, error);
      return of([] as T[]); // Retornar un array vacío en caso de error
    }
  }

  // Obtener documento por ID
  async getDocById<T>(collectionPath: string, id: string): Promise<T | null> {
    try {
      console.log(`Obteniendo documento: ${collectionPath}/${id}`);
      const docRef = doc(this.firestore, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        console.log(`Documento no encontrado: ${collectionPath}/${id}`);
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  // Agregar documento
  async addDoc(collectionPath: string, data: any): Promise<string> {
    try {
      console.log(`Añadiendo documento a: ${collectionPath}`, data);
      const collectionRef = collection(this.firestore, collectionPath);
      const docRef = await addDoc(collectionRef, data);
      console.log(`Documento añadido con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`Error al añadir documento a ${collectionPath}:`, error);
      throw error;
    }
  }

  // Establecer documento con ID específico
  async setDoc(collectionPath: string, id: string, data: any): Promise<void> {
    try {
      console.log(`Estableciendo documento: ${collectionPath}/${id}`, data);
      const docRef = doc(this.firestore, collectionPath, id);
      await setDoc(docRef, data);
      console.log(`Documento establecido correctamente: ${collectionPath}/${id}`);
    } catch (error) {
      console.error(`Error al establecer documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  // Actualizar documento
  async updateDoc(collectionPath: string, id: string, data: any): Promise<void> {
    try {
      console.log(`Actualizando documento: ${collectionPath}/${id}`, data);
      const docRef = doc(this.firestore, collectionPath, id);
      await updateDoc(docRef, data);
      console.log(`Documento actualizado correctamente: ${collectionPath}/${id}`);
    } catch (error) {
      console.error(`Error al actualizar documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  // Eliminar documento
  async deleteDoc(collectionPath: string, id: string): Promise<void> {
    try {
      console.log(`Eliminando documento: ${collectionPath}/${id}`);
      const docRef = doc(this.firestore, collectionPath, id);
      await deleteDoc(docRef);
      console.log(`Documento eliminado correctamente: ${collectionPath}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  // Obtener actualización en tiempo real de un documento
  getDocObservable<T>(collectionPath: string, id: string): Observable<T> {
    console.log(`Observando documento: ${collectionPath}/${id}`);
    
    try {
      const docRef = doc(this.firestore, collectionPath, id);
      
      return new Observable<T>(observer => {
        const unsubscribe = onSnapshot(docRef, 
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = { id: docSnapshot.id, ...docSnapshot.data() } as T;
              observer.next(data);
            } else {
              // Si el documento no existe, retornamos un objeto vacío en lugar de error
              // para evitar que se rompa la suscripción
              console.warn(`Documento no encontrado: ${collectionPath}/${id}`);
              observer.next({} as T);
            }
          },
          (error) => {
            console.error(`Error al observar documento ${collectionPath}/${id}:`, error);
            observer.error(error);
          }
        );
        
        // Cleanup function
        return { unsubscribe };
      }).pipe(
        catchError(error => {
          console.error(`Error en observable de documento ${collectionPath}/${id}:`, error);
          return of({} as T); // Retornar un objeto vacío en caso de error
        })
      );
    } catch (error) {
      console.error(`Error al configurar observable para documento ${collectionPath}/${id}:`, error);
      return of({} as T); // Retornar un objeto vacío en caso de error
    }
  }

  // Obtener documentos filtrados por campo
  async getDocsByField<T>(collectionPath: string, field: string, value: any): Promise<T[]> {
    try {
      console.log(`Buscando documentos en ${collectionPath} donde ${field} = ${value}`);
      const collectionRef = collection(this.firestore, collectionPath);
      const q = query(collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
      
      console.log(`Encontrados ${results.length} documentos`);
      return results;
    } catch (error) {
      console.error(`Error al buscar documentos en ${collectionPath} por campo ${field}:`, error);
      return [];
    }
  }

  // Crear colección con documentos iniciales
  async initializeCollection(collectionPath: string, documents: any[]): Promise<void> {
    try {
      console.log(`Inicializando colección ${collectionPath} con ${documents.length} documentos`);
      for (const docData of documents) {
        if (docData.id) {
          const id = docData.id;
          const data = { ...docData };
          delete data.id;
          await this.setDoc(collectionPath, id, data);
        } else {
          await this.addDoc(collectionPath, docData);
        }
      }
      console.log(`Colección ${collectionPath} inicializada correctamente`);
    } catch (error) {
      console.error(`Error al inicializar colección ${collectionPath}:`, error);
      throw error;
    }
  }
}