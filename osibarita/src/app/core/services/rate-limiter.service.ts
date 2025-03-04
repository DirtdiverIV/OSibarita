// src/app/core/services/rate-limiter.service.ts
import { Injectable } from '@angular/core';

/**
 * Servicio para limitar la frecuencia de peticiones a Firebase
 * Evita que se realicen demasiadas peticiones en poco tiempo
 */
@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  // Mapa para guardar timestamp de última petición por clave
  private timestamps = new Map<string, number>();
  
  // Intervalo mínimo entre peticiones del mismo tipo (5 segundos)
  private minInterval = 5000;

  constructor() {
    console.log('RateLimiterService inicializado');
  }

  /**
   * Verifica si es posible hacer una petición o es demasiado pronto
   * @param key Identificador único de la petición
   * @returns true si la petición puede realizarse, false si debe esperar
   */
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const lastRequest = this.timestamps.get(key) || 0;
    
    // Si no ha pasado el tiempo mínimo, rechazar petición
    if (now - lastRequest < this.minInterval) {
      console.log(`[RateLimiter] Petición bloqueada para ${key}: demasiado pronto`);
      return false;
    }
    
    // Actualizar timestamp y permitir petición
    this.timestamps.set(key, now);
    return true;
  }

  /**
   * Reinicia el contador para una clave específica
   * Útil cuando se necesita forzar una petición
   */
  resetRequestTimer(key: string): void {
    const oldValue = this.timestamps.get(key);
    this.timestamps.delete(key);
    console.log(`[RateLimiter] Timer reiniciado para ${key}. Valor anterior: ${oldValue}`);
  }

  /**
   * Limpia todas las entradas antiguas del mapa
   * Debe llamarse periódicamente para evitar crecimiento indefinido
   */
  cleanupOldEntries(): void {
    const now = Date.now();
    const threshold = now - (this.minInterval * 10); // 10 veces el intervalo mínimo
    
    let cleanedCount = 0;
    this.timestamps.forEach((timestamp, key) => {
      if (timestamp < threshold) {
        this.timestamps.delete(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`[RateLimiter] Limpieza de entradas: ${cleanedCount} eliminadas`);
    }
  }
}