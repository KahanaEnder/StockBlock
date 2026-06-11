import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { ProductionRecord } from '$lib/models/production';

export const produccionStore = createFirestoreStore<ProductionRecord>('produccion');
