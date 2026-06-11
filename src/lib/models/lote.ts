export class Lote {
    id: string | number;
    producto: string;
    cantidad: number;
    estado: 'activo' | 'en_espera' | 'entregado';
    fechaCreacion: string;
    fechaModificacion: string | null;

    constructor(producto: string, cantidad: number) {
        this.id = Date.now();
        this.producto = producto;
        this.cantidad = cantidad;
        this.estado = 'activo';
        this.fechaCreacion = new Date().toISOString();
        this.fechaModificacion = null;
    }
}
