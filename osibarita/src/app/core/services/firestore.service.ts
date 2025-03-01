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
  collectionData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // Obtener colección con actualizaciones en tiempo real
  getCollection<T>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<T[]>;
  }

  // Obtener documento por ID
  async getDocById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  }

  // Agregar documento
  async addDoc(collectionName: string, data: any): Promise<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  }

  // Establecer documento con ID específico
  async setDoc(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return setDoc(docRef, data);
  }

  // Actualizar documento
  async updateDoc(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return updateDoc(docRef, data);
  }

  // Eliminar documento
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return deleteDoc(docRef);
  }

  // Obtener actualización en tiempo real de un documento
  getDocObservable<T>(collectionName: string, id: string): Observable<T> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return new Observable<T>(observer => {
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          observer.next({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          observer.error('Documento no encontrado');
        }
      }, (error) => {
        observer.error(error);
      });
      
      // Cleanup function
      return { unsubscribe };
    });
  }

  // Obtener documentos filtrados por campo
  async getDocsByField<T>(collectionName: string, field: string, value: any): Promise<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, where(field, '==', value));
    const querySnapshot = await getDocs(q);
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return results;
  }

  // Crear colección con documentos iniciales
  async initializeCollection(collectionName: string, documents: any[]): Promise<void> {
    for (const doc of documents) {
      if (doc.id) {
        const id = doc.id;
        delete doc.id;
        await this.setDoc(collectionName, id, doc);
      } else {
        await this.addDoc(collectionName, doc);
      }
    }
  }
}