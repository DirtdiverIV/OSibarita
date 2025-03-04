// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Registrar datos de localización española
registerLocaleData(localeEs, 'es');

// Monitorear y registrar errores no controlados
window.addEventListener('error', (event) => {
  console.error('[App-Global-Error]', event.error);
  
  // Si el error está relacionado con Firebase, registrarlo especialmente
  if (event.error && event.error.toString().includes('firebase')) {
    console.error('[Firebase-Error]', event.error);
    
    // Registrar peticiones pendientes o en curso
    if (event.error.code === 'deadline-exceeded' || event.error.code === 'unavailable') {
      console.warn('[Firebase-Quota] Posible exceso de cuota o límite de peticiones');
    }
  }
});

// Monitorear promesas rechazadas no controladas
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled-Promise-Rejection]', event.reason);
  
  // Si el error está relacionado con Firebase, registrarlo especialmente
  if (event.reason && event.reason.toString().includes('firebase')) {
    console.error('[Firebase-Promise-Error]', event.reason);
  }
});

// Si estamos en desarrollo, mostrar advertencia sobre datos falsos
if (!environment.production) {
  console.log('Modo de desarrollo activado');
  console.log('mockData:', environment.mockData ? 'ACTIVADO' : 'DESACTIVADO');
  
  if (environment.mockData) {
    console.warn('ADVERTENCIA: La inicialización de datos mock está ACTIVADA. Esto puede generar muchas peticiones a Firebase.');
  }
}

// Iniciar aplicación
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Error al iniciar la aplicación:', err);
    
    // Mostrar un mensaje amigable al usuario si el error es crítico
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #D4AF37;">Error al cargar la aplicación</h1>
          <p>Ha ocurrido un error al iniciar la aplicación. Por favor, intenta recargar la página.</p>
          <button onclick="window.location.reload()" 
                  style="background: linear-gradient(135deg, #D4AF37 0%, #8A6E1E 100%); 
                         color: black; 
                         border: none;
                         padding: 10px 20px; 
                         border-radius: 4px; 
                         cursor: pointer;
                         margin-top: 15px;">
            Recargar página
          </button>
        </div>
      `;
    }
  });