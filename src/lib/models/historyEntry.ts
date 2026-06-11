export type HistoryAction = 'ALERTA' | 'PROPUESTA_PONER_EN_ESPERA' | 'OTRA_ACCION';

export class HistoryEntry {
    id: string | number;
    loteId?: string | number;
    producto?: string;
    action: HistoryAction;
    usuario: string;
    motivo: string;
    fecha: string;

    constructor(action: HistoryAction, usuario: string, motivo: string, loteId?: string | number, producto?: string) {
        this.id = Date.now();
        this.loteId = loteId;
        this.producto = producto;
        this.action = action;
        this.usuario = usuario;
        this.motivo = motivo;
        this.fecha = new Date().toISOString();
    }
}
