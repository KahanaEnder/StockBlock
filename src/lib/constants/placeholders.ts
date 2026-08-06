export const PlaceHolders = {
    MECAMBLOCK: 'MecamBlock',
    LOGO: '/images/mecamblocklogo.jpg',
    ADMIN: 'Administrador',
    EMAIL: 'Email',
    PASSWORD: 'Contraseña',
    ENTER_EMAIL: 'Ingresa tu email',
    ENTER_PASSWORD: 'Ingresa tu contraseña',
    LOGIN: 'Iniciar Sesión',
    LOGIN_SUCCESS: 'Iniciando Sesión...',
    ACCESS_D: 'Acceso Denegado',
    PH: 'No tienes permiso para acceder a esta página o la sesión expiró.',
} as const;
export type PlaceHolderKey = keyof typeof PlaceHolders;