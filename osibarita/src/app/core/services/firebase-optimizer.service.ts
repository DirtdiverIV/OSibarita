// src/app/core/services/firebase-optimizer.service.ts
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
  onSnapshot
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

/**
 * Servicio para optimizar las peticiones a Firebase
 * Implementa un patrón de caché y limita las suscripciones activas
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseOptimizerService {
  // Caché para guardar resultado de colecciones
  private collectionCache: Map<string, { 
    subject: BehaviorSubject<any[]>, 
    timestamp: number,
    unsubscribe?: () => void 
  }> = new Map();
  
  // Caché para guardar resultado de documentos
  private documentCache: Map<string, { 
    subject: BehaviorSubject<any>, 
    timestamp: number,
    unsubscribe?: () => void 
  }> = new Map();
  
  // Tiempo de vida de la caché en ms (1 minuto)
  private cacheTTL = 60 * 1000;
  
  // Contador de operaciones para monitorear
  private requestCount = 0;

  constructor(private firestore: Firestore) {
    console.log('FirebaseOptimizerService inicializado');
  }

  /**
   * Obtener una colección con caché
   */
  getCollection<T>(collectionPath: string): Observable<T[]> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: getCollection(${collectionPath})`);
    
    // Verificar si está en caché y no ha expirado
    const cacheKey = `collection:${collectionPath}`;
    const cached = this.collectionCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      console.log(`[FirebaseOptimizer] Usando caché para ${collectionPath}`);
      return cached.subject.asObservable();
    }
    
    // Si no está en caché o expiró, crear nueva suscripción
    try {
      console.log(`[FirebaseOptimizer] Creando nueva suscripción para ${collectionPath}`);
      
      // Limpiar suscripción anterior si existe
      if (cached && cached.unsubscribe) {
        cached.unsubscribe();
      }
      
      const collectionRef = collection(this.firestore, collectionPath);
      const q = query(collectionRef);
      
      // Crear un BehaviorSubject para poder compartir los datos
      const subject = new BehaviorSubject<T[]>([]);
      
      // Crear la suscripción a Firestore
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const items: T[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as T);
          });
          subject.next(items);
        },
        (error) => {
          console.error(`[FirebaseOptimizer] Error en getCollection para ${collectionPath}:`, error);
          subject.error(error);
        }
      );
      
      // Guardar en caché
      this.collectionCache.set(cacheKey, {
        subject,
        timestamp: Date.now(),
        unsubscribe
      });
      
      return subject.asObservable().pipe(
        catchError(error => {
          console.error(`[FirebaseOptimizer] Error en getCollection para ${collectionPath}:`, error);
          return of([] as T[]);
        })
      );
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al configurar suscripción para ${collectionPath}:`, error);
      return of([] as T[]);
    }
  }

  /**
   * Obtener un documento específico con caché
   */
  getDocument<T>(collectionPath: string, id: string): Observable<T | null> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: getDocument(${collectionPath}/${id})`);
    
    // Verificar si está en caché y no ha expirado
    const cacheKey = `document:${collectionPath}/${id}`;
    const cached = this.documentCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      console.log(`[FirebaseOptimizer] Usando caché para ${collectionPath}/${id}`);
      return cached.subject.asObservable();
    }
    
    // Si no está en caché o expiró, crear nueva suscripción
    try {
      console.log(`[FirebaseOptimizer] Creando nueva suscripción para ${collectionPath}/${id}`);
      
      // Limpiar suscripción anterior si existe
      if (cached && cached.unsubscribe) {
        cached.unsubscribe();
      }
      
      const docRef = doc(this.firestore, collectionPath, id);
      const subject = new BehaviorSubject<T | null>(null);
      
      const unsubscribe = onSnapshot(docRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = { id: docSnapshot.id, ...docSnapshot.data() } as T;
            subject.next(data);
          } else {
            subject.next(null);
          }
        },
        (error) => {
          console.error(`[FirebaseOptimizer] Error en getDocument para ${collectionPath}/${id}:`, error);
          subject.error(error);
        }
      );
      
      // Guardar en caché
      this.documentCache.set(cacheKey, {
        subject,
        timestamp: Date.now(),
        unsubscribe
      });
      
      return subject.asObservable().pipe(
        catchError(error => {
          console.error(`[FirebaseOptimizer] Error en getDocument para ${collectionPath}/${id}:`, error);
          return of(null);
        })
      );
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al configurar suscripción para ${collectionPath}/${id}:`, error);
      return of(null);
    }
  }

  /**
   * Agregar documento a una colección
   */
  async addDoc(collectionPath: string, data: any): Promise<string> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: addDoc(${collectionPath})`);
    
    try {
      const collectionRef = collection(this.firestore, collectionPath);
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al añadir documento a ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Establecer documento con ID específico
   */
  async setDoc(collectionPath: string, id: string, data: any): Promise<void> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: setDoc(${collectionPath}/${id})`);
    
    try {
      const docRef = doc(this.firestore, collectionPath, id);
      await setDoc(docRef, data);
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al establecer documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar documento
   */
  async updateDoc(collectionPath: string, id: string, data: any): Promise<void> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: updateDoc(${collectionPath}/${id})`);
    
    try {
      const docRef = doc(this.firestore, collectionPath, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al actualizar documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDoc(collectionPath: string, id: string): Promise<void> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: deleteDoc(${collectionPath}/${id})`);
    
    try {
      const docRef = doc(this.firestore, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al eliminar documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documento por ID (una sola vez, sin suscripción)
   */
  async getDocById<T>(collectionPath: string, id: string): Promise<T | null> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: getDocById(${collectionPath}/${id})`);
    
    try {
      const docRef = doc(this.firestore, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al obtener documento ${collectionPath}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener documentos filtrados por campo
   */
  async getDocsByField<T>(collectionPath: string, field: string, value: any): Promise<T[]> {
    this.requestCount++;
    console.log(`[FirebaseOptimizer] Petición #${this.requestCount}: getDocsByField(${collectionPath}, ${field}=${value})`);
    
    try {
      const collectionRef = collection(this.firestore, collectionPath);
      const q = query(collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
      
      return results;
    } catch (error) {
      console.error(`[FirebaseOptimizer] Error al buscar documentos en ${collectionPath} por campo ${field}:`, error);
      return [];
    }
  }

  /**
   * Limpiar todas las suscripciones
   */
  /**
   * Limpiar todas las suscripciones - uso emergencia o al desmontar la app
   */
  cleanupSubscriptions(): void {
    console.log('[FirebaseOptimizer] Limpiando todas las suscripciones');
    
    // Limpiar suscripciones de colecciones
    this.collectionCache.forEach(value => {
      if (value.unsubscribe) {
        value.unsubscribe();
      }
    });
    this.collectionCache.clear();
    
    // Limpiar suscripciones de documentos
    this.documentCache.forEach(value => {
      if (value.unsubscribe) {
        value.unsubscribe();
      }
    });
    this.documentCache.clear();
  }
  
  /**
   * Limpiar solo suscripciones antiguas para liberar recursos
   * Más seguro que cleanupSubscriptions() para uso periódico
   */
  cleanupOldSubscriptions(): void {
    console.log('[FirebaseOptimizer] Limpiando suscripciones antiguas');
    const now = Date.now();
    const timeThreshold = now - (this.cacheTTL * 3); // Tres veces el TTL
    
    // Limpiar suscripciones antiguas de colecciones
    let countCollection = 0;
    this.collectionCache.forEach((value, key) => {
      if (value.timestamp < timeThreshold) {
        if (value.unsubscribe) {
          value.unsubscribe();
        }
        this.collectionCache.delete(key);
        countCollection++;
      }
    });
    
    // Limpiar suscripciones antiguas de documentos
    let countDocument = 0;
    this.documentCache.forEach((value, key) => {
      if (value.timestamp < timeThreshold) {
        if (value.unsubscribe) {
          value.unsubscribe();
        }
        this.documentCache.delete(key);
        countDocument++;
      }
    });
    
    if (countCollection > 0 || countDocument > 0) {
      console.log(`[FirebaseOptimizer] Limpieza: ${countCollection} colecciones y ${countDocument} documentos eliminados`);
    }
  }
}