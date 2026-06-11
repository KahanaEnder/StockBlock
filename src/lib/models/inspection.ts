export class Inspection {
    id: string | number;
    loteId: string | number;
    producto: string;
    inspeccionado: number;
    defectuoso: number;
    fecha: string;

    constructor(loteId: string | number, producto: string, inspeccionado: number, defectuoso: number) {
        this.id = Date.now();
        this.loteId = loteId;
        this.producto = producto;
        this.inspeccionado = inspeccionado;
        this.defectuoso = defectuoso;
        this.fecha = new Date().toISOString();
    }

    get percentage(): number {
        if (!this.inspeccionado || this.inspeccionado === 0) return 0;
        return (this.defectuoso / this.inspeccionado) * 100;
    }
}
