// src/app/core/firebase/firebase.module.ts
import { NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ],
  exports: []
})
export class FirebaseModule { }