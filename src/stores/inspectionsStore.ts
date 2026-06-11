import { createFirestoreStore } from '$lib/stores/firestoreStore';
import type { Inspection } from '$lib/models/inspection';
import { Inspection as InspectionClass } from '$lib/models/inspection';
import { get } from 'svelte/store';
import { lotesStore } from './lotesStore';
import { historyStore, addHistory } from './historyStore';
import * as firestore from '$lib/services/firestore';

export const inspectionsStore = createFirestoreStore<Inspection>('inspections');

export function calcPercentage(i: Inspection) {
	if (!i.inspeccionado || i.inspeccionado === 0) return 0;
	return (i.defectuoso / i.inspeccionado) * 100;
}

export function averagePercentageByProduct(producto: string) {
	const all = get(inspectionsStore);
	const filtered = all.filter(x => x.producto === producto);
	if (!filtered.length) return 0;
	const sum = filtered.reduce((s, it) => s + (it.inspeccionado ? (it.defectuoso / it.inspeccionado) * 100 : 0), 0);
	return sum / filtered.length;
}

export function addInspection(nuevo: InspectionClass, options?: { usuario?: string; autoHold?: boolean; thresholdFactor?: number }) {
	const usuario = options?.usuario ?? 'Sistema';
	const autoHold = options?.autoHold ?? false;
	const thresholdFactor = options?.thresholdFactor ?? 1.0;

	inspectionsStore.add(nuevo);

	const allBefore = get(inspectionsStore).filter(i => i.id !== nuevo.id && i.producto === nuevo.producto);
	const avgBefore = allBefore.length
		? allBefore.reduce((s, it) => s + (it.inspeccionado ? (it.defectuoso / it.inspeccionado) * 100 : 0), 0) / allBefore.length
		: 0;

	const porcentajeNuevo = calcPercentage(nuevo);

	if (avgBefore > 0 && porcentajeNuevo > avgBefore * thresholdFactor) {
		const motivo = `Porcentaje nuevo ${porcentajeNuevo.toFixed(2)}% > promedio histórico ${avgBefore.toFixed(2)}%`;
		addHistory({
			action: 'ALERTA',
			usuario,
			motivo,
			loteId: nuevo.loteId,
			producto: nuevo.producto
		});

		addHistory({
			action: 'PROPUESTA_PONER_EN_ESPERA',
			usuario,
			motivo: `Se recomienda poner en espera el lote ${nuevo.loteId}`,
			loteId: nuevo.loteId,
			producto: nuevo.producto
		});

		alert(`ALERTA: ${motivo}\nSe propone poner lote ${nuevo.loteId} en espera.`);

		if (autoHold) {
			const lote = get(lotesStore).find(l => l.id === nuevo.loteId);
			if (lote && lote.id) {
				firestore.update('lotes', String(lote.id), {
					estado: 'en_espera',
					fechaModificacion: new Date().toISOString()
				});
			}
		}
	}
}
