export class ProductionRecord {
    id: string | number;
    productoNombre: string;
    cantidad: number;
    fechaProduccion: string;
    fechaRegistro: string;
    fechaModificacion: string | null;

    constructor(productoNombre: string, cantidad: number, fechaProduccion: string) {
        this.id = Date.now();
        this.productoNombre = productoNombre;
        this.cantidad = cantidad;
        this.fechaProduccion = fechaProduccion;
        this.fechaRegistro = new Date().toISOString();
        this.fechaModificacion = null;
    }
}
