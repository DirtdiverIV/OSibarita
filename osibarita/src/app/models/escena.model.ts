// src/app/models/escena.model.ts
export interface Escena {
    id?: string;
    titulo: string;
    descripcion?: string;
    contenido: any; // Contenido específico de la escena
    duracion: number; // Tiempo en segundos que se muestra la escena
    orden: number; // Orden de aparición
  }