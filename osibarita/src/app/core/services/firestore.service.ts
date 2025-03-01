// src/app/core/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  collectionData,
  DocumentReference,
  CollectionReference 
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // Obtener colección con actualizaciones en tiempo real
  getCollection<T>(collectionPath: string): Observable<T[]> {
    try {
      console.log(`Obteniendo colección: ${collectionPath}`);
      const collectionRef = collection(this.firestore, collectionPath);
      return collectionData(collectionRef, { idField: 'id' }) as Observable<T[]>;
    } catch (error) {
      console.error(`Error al obtener colección ${collectionPath}:`, error);
      return throwError(() => new Error(`Error al obtener colección ${collectionPath}: ${error}`));
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
      throw new Error(`Error al obtener documento ${collectionPath}/${id}: ${error}`);
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
      throw new Error(`Error al añadir documento a ${collectionPath}: ${error}`);
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
      throw new Error(`Error al establecer documento ${collectionPath}/${id}: ${error}`);
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
      throw new Error(`Error al actualizar documento ${collectionPath}/${id}: ${error}`);
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
      throw new Error(`Error al eliminar documento ${collectionPath}/${id}: ${error}`);
    }
  }

  // Obtener actualización en tiempo real de un documento
  getDocObservable<T>(collectionPath: string, id: string): Observable<T> {
    console.log(`Observando documento: ${collectionPath}/${id}`);
    const docRef = doc(this.firestore, collectionPath, id);
    
    return new Observable<T>(observer => {
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as T;
          observer.next(data);
        } else {
          observer.error(`Documento no encontrado: ${collectionPath}/${id}`);
        }
      }, (error) => {
        console.error(`Error al observar documento ${collectionPath}/${id}:`, error);
        observer.error(error);
      });
      
      // Cleanup function
      return { unsubscribe };
    }).pipe(
      catchError(error => {
        console.error(`Error en observable de documento ${collectionPath}/${id}:`, error);
        return throwError(() => error);
      })
    );
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
      throw new Error(`Error al buscar documentos en ${collectionPath} por campo ${field}: ${error}`);
    }
  }

  // Crear colección con documentos iniciales
  async initializeCollection(collectionPath: string, documents: any[]): Promise<void> {
    try {
      console.log(`Inicializando colección ${collectionPath} con ${documents.length} documentos`);
      for (const doc of documents) {
        if (doc.id) {
          const id = doc.id;
          const docData = { ...doc };
          delete docData.id;
          await this.setDoc(collectionPath, id, docData);
        } else {
          await this.addDoc(collectionPath, doc);
        }
      }
      console.log(`Colección ${collectionPath} inicializada correctamente`);
    } catch (error) {
      console.error(`Error al inicializar colección ${collectionPath}:`, error);
      throw new Error(`Error al inicializar colección ${collectionPath}: ${error}`);
    }
  }
}