import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { Lote } from '$lib/models/lote';

export const lotesStore = createFirestoreStore<Lote>('lotes');
