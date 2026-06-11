export class Defecto {
    id: string | number;
    produccionId: string | number;
    producto: string;
    descripcion: string;
    gravedad: 'baja' | 'media' | 'alta';
    fechaCreacion: string;
    fechaModificacion: string | null;
    estado: 'segunda_mano' | 'cerrado';

    constructor(produccionId: string | number, producto: string, descripcion: string, gravedad: 'baja' | 'media' | 'alta') {
        this.id = Date.now();
        this.produccionId = produccionId;
        this.producto = producto;
        this.descripcion = descripcion;
        this.gravedad = gravedad;
        this.fechaCreacion = new Date().toISOString();
        this.fechaModificacion = null;
        this.estado = 'segunda_mano';
    }
}
