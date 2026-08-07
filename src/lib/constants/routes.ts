export const Routes = {
    LOGIN: '/login',
    MAIN: '/main',
    STOCK: '/stock',
    PRODUCCION: '/produccion',
    DEFECTOS: '/defectos',
    REPORTES: '/reportes',
    MANTENIMIENTO: '/mantenimiento',
    DIAGRAMAS: '/diagramas',
    PEDIDOS: '/pedidos',
    ENTREGAS: '/entregas',
    AUSENTISMO: '/ausentismo',
    LOTES: '/lotes',
} as const;
export type RoutesKey = keyof typeof Routes;