// src/app/models/configuracion-tv.model.ts
export interface ConfiguracionTV {
  vista: string; // ID de la vista actual
  temporizador: number; // Tiempo en segundos para cambios automáticos
  ultimaActualizacion?: Date | any; // Puede ser Date o Timestamp de Firestore
}