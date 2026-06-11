import { createFirestoreStore } from './firestoreStore';
import type { StockItem } from '$lib/models/stock';

export const stockStore = createFirestoreStore<StockItem>('stock');
