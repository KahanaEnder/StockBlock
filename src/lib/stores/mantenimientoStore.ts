import { createFirestoreStore } from './firestoreStore';
import type { Mantenimiento } from '$lib/models/mantenimiento';

export const mantenimientoStore = createFirestoreStore<Mantenimiento>('mantenimiento');
