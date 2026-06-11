export class Entrega {
    id: string | number;
    cliente: string;
    documento?: string;
    firma?: string;
    estado: 'pendiente' | 'entregado' | 'finalizado';
    fechaCreacion: string;
    fechaModificacion: string | null;

    constructor(cliente: string, documento?: string, firma?: string) {
        this.id = Date.now();
        this.cliente = cliente;
        this.documento = documento;
        this.firma = firma;
        this.estado = 'pendiente';
        this.fechaCreacion = new Date().toISOString();
        this.fechaModificacion = null;
    }
}
