import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { Mantenimiento } from '$lib/models/mantenimiento';

export const mantenimientoStore = createFirestoreStore<Mantenimiento>('mantenimientos');
