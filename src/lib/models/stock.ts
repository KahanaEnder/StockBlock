export class StockItem {
    id: string | number;
    nombre: string;
    categoria: string;
    cantidad: number;
    stockMinimo: number;
    fechaCreacion: string;
    fechaModificacion: string | null;

    constructor(nombre: string, cantidad: number, categoria: string = 'General', stockMinimo: number = 5) {
        this.id = Date.now();
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.categoria = categoria;
        this.stockMinimo = stockMinimo;
        this.fechaCreacion = new Date().toISOString();
        this.fechaModificacion = null;
    }
}
