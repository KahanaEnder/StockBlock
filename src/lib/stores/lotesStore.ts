import { createFirestoreStore } from './firestoreStore';
import type { Lote } from '$lib/models/lote';

export const lotesStore = createFirestoreStore<Lote>('lotes');
