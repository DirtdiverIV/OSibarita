// src/app/models/menu-dia.model.ts
import { MenuItem } from './menu.model';

export interface MenuDia {
  id?: string;
  fecha: Date;
  precio: number;
  descripcion?: string;
  disponible: boolean;
}

// Esta interfaz extiende MenuItem pero elimina el precio individual
export interface MenuDiaItem extends Omit<MenuItem, 'price'> {
  id?: string;
  name: string;
  description: string;
  category: 'primeros' | 'segundos' | 'postres';
}