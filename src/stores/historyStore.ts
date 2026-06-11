import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { HistoryEntry } from '$lib/models/historyEntry';
import { HistoryEntry as HistoryEntryClass } from '$lib/models/historyEntry';

export const historyStore = createFirestoreStore<HistoryEntry>('history');

export function addHistory(payload: { action: any; usuario: string; motivo: string; loteId?: string | number; producto?: string }) {
	const h = new HistoryEntryClass(payload.action, payload.usuario, payload.motivo, payload.loteId, payload.producto);
	historyStore.add(h);
	return h;
}
