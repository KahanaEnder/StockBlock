export const Routes = {
    LOGIN: '/login',
    STOCK: '/stock',
    MAIN: '/main',
    PROD: '/production',
    DEFECTIVE: '/defectives',
    REPORT: '/reports',
    MAINTENANCE: '/maintenance',
    CHART: '/charts',
    ORDER: '/orders',
    DELIVERIES: '/deliveries',
    ABSENT: '/absenteeism',
    BATCH: '/batches',
} as const;
export type RoutesKey = keyof typeof Routes;