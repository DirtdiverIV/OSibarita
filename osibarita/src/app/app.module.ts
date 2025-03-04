// src/app/app.module.ts
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Servicios y módulos propios
import { AppInitializerService } from './core/services/app-initializer.service';
import { FirebaseOptimizerService } from './core/services/firebase-optimizer.service';
import { RateLimiterService } from './core/services/rate-limiter.service';
import { FirebaseModule } from './core/firebase/firebase.module';
import { HomeModule } from './features/home/home.module';

// Factory para inicializar la aplicación (ahora sin carga de datos mock)
export function initializeAppFactory(appInitializer: AppInitializerService) {
  return () => appInitializer.initializeApp();
}

// Factory para crear servicio de limpiar caché periódicamente
export function setupCacheCleanupFactory(
  firebaseOptimizer: FirebaseOptimizerService, 
  rateLimiter: RateLimiterService
) {
  return () => {
    // Configurar limpieza de caché del optimizador cada 15 minutos
    const interval = setInterval(() => {
      console.log('[App] Ejecutando limpieza periódica de caché');
      firebaseOptimizer.cleanupSubscriptions();
      rateLimiter.cleanupOldEntries();
    }, 15 * 60 * 1000);
    
    // También limpiar al cerrar la aplicación
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      firebaseOptimizer.cleanupSubscriptions();
    });
    
    return Promise.resolve();
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    FirebaseModule,
    HomeModule
  ],
  providers: [
    // Servicio optimizador de Firebase
    FirebaseOptimizerService,
    
    // Servicio de rate limiting
    RateLimiterService,
    
    // Inicializador de la aplicación
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppInitializerService],
      multi: true
    },
    
    // Limpieza periódica de caché
    {
      provide: APP_INITIALIZER,
      useFactory: setupCacheCleanupFactory,
      deps: [FirebaseOptimizerService, RateLimiterService],
      multi: true
    },
    
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }