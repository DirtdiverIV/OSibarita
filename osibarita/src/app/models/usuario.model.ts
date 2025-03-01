// src/app/models/usuario.model.ts
export interface Usuario {
    uid: string;
    email: string;
    nombre?: string;
    rol: 'admin' | 'usuario';
    fechaCreacion: Date;
  }