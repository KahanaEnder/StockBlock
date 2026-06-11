import { createFirestoreStore } from './firestoreStore';

export interface Ausentismo {
  id?: string | number;
  operario: string;
  horasTrabajadas: number | null;
  observaciones: string;
  causaMayorFuerza: string;
  fechaRegistro: string;
  fechaModificacion?: string;
}

export const ausentismoStore = createFirestoreStore<Ausentismo>('ausentismo');
