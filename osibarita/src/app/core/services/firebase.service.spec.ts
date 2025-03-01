// src/app/core/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  // Configuración de Firebase proporcionada
  private firebaseConfig = {
    apiKey: "AIzaSyDrL3QJe03a3sP5JfQ0OJr3n7PnnQ1oNoo",
    authDomain: "sibarita-b1a91.firebaseapp.com",
    projectId: "sibarita-b1a91",
    storageBucket: "sibarita-b1a91.firebasestorage.app",
    messagingSenderId: "324055182327",
    appId: "1:324055182327:web:398e397c8d38bf77d29cf2",
    measurementId: "G-4W5ERPNPG3"
  };

  // Inicialización de Firebase
  private app = initializeApp(this.firebaseConfig);
  public db = getFirestore(this.app);
  public auth = getAuth(this.app);

  constructor() {
    console.log('Firebase inicializado correctamente');
  }
}