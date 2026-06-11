import { createFirestoreStore } from '$lib/stores/firestoreStore';

export interface Ausentismo {
	id: string | number;
	operario: string;
	horasTrabajadas: number;
	observaciones: string;
	causaMayorFuerza: string;
	fechaCreacion: string;
	fechaModificacion?: string;
}

export const ausentismoStore = createFirestoreStore<Ausentismo>('ausentismo');
