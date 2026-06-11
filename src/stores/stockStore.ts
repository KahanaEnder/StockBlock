import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { StockItem } from '$lib/models/stock';

export const stockStore = createFirestoreStore<StockItem>('stock');
