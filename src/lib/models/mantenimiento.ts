export interface Mantenimiento {
	id: number;
	fecha: string;
	maquina: string;
	observaciones: string;
	repuestos: string;
	tecnico: string;
	fechaRegistro: string;
	fechaModificacion?: string;
}
