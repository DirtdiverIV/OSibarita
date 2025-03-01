// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  authState, 
  User 
} from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable del estado de autenticación
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestoreService: FirestoreService
  ) {
    this.user$ = authState(this.auth);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  // Iniciar sesión con email y contraseña
  async login(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario (solo para administradores)
  async register(email: string, password: string, nombre: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Guardar información adicional del usuario en Firestore
      const usuario: Usuario = {
        uid: result.user.uid,
        email: email,
        nombre: nombre,
        rol: 'admin', // Por defecto, todos los usuarios registrados son admin
        fechaCreacion: new Date()
      };
      
      await this.firestoreService.setDoc('usuarios', result.user.uid, usuario);
      
      return result.user;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Obtener información completa del usuario desde Firestore
  async getCurrentUserInfo(): Promise<Usuario | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    return this.firestoreService.getDocById<Usuario>('usuarios', user.uid);
  }
}